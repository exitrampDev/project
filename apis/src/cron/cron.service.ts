// src/cron/cron.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { subMonths } from 'date-fns';

import { BusinessListingService } from '../business-listing/business-listing.service';
import { UsersService } from 'src/users/users.service';
import { PaymentService } from 'src/payment/payment.service';
import { ListingTypes } from 'src/business-listing/dto/create-business.dto';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly businessListingService: BusinessListingService,
    private readonly usersService: UsersService,
    private readonly paymentsService: PaymentService,
  ) {}

  // ============================================================
  // PLAN PRICES
  // ============================================================

  private readonly PLAN_PRICES = {
    NORMAL: 15,
    PREMIUM: 30,
  };

  /**
   * Returns the monthly price for a listing type.
   */
  private getMonthlyPrice(listingType: string): number {
    return listingType === ListingTypes.NORMAL
      ? this.PLAN_PRICES.NORMAL
      : this.PLAN_PRICES.PREMIUM;
  }

  // ============================================================
  // DAILY PAYMENT CHECK
  // ============================================================

  /**
   * Runs every day at 1 AM.
   *
   * Finds listings whose last payment is older than one month
   * and marks them as pending for payment.
   *
   * IMPORTANT:
   * This is renewal logic only.
   * It does NOT handle plan upgrades.
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleDailyJob() {
    this.logger.log('Running payment check cron...');

    try {
      const oneMonthAgo = subMonths(new Date(), 1);

      const businesses =
        await this.businessListingService.findLastPaymentOlderThan(
          oneMonthAgo,
        );

      this.logger.log(
        `Found ${businesses.length} businesses requiring payment check`,
      );

      for (const business of businesses) {
        try {
          this.logger.log(
            `Checking business ${business._id} - last payment: ${
              business.paymentDate ?? 'N/A'
            }`,
          );

          /**
           * First listing without a payment date.
           *
           * Keep your existing 6-month logic here.
           */
          if (
            business.isFirstListing &&
            (business.paymentDate === null ||
              business.paymentDate === undefined)
          ) {
            const pastDate = new Date(business.createdAt!);
            const now = new Date();

            const sixMonthsInMs =
              6 * 30 * 24 * 60 * 60 * 1000;

            const elapsedTime = now.getTime() - pastDate.getTime();

            if (elapsedTime >= sixMonthsInMs) {
              await this.businessListingService.markBusinessAsPendingForPayment(
                business._id.toString(),
              );

              this.logger.log(
                `Business ${business._id} marked pending after 6 months`,
              );
            }

            continue;
          }

          /**
           * Normal renewal case.
           */
          await this.businessListingService.markBusinessAsPendingForPayment(
            business._id.toString(),
          );

          this.logger.log(
            `Business ${business._id} marked pending for payment`,
          );
        } catch (businessError: any) {
          this.logger.error(
            `Error processing business ${business._id}`,
            businessError?.stack ||
              businessError?.message ||
              JSON.stringify(businessError),
          );
        }
      }

      if (!businesses.length) {
        this.logger.log('No overdue businesses found');
      }
    } catch (error: any) {
      this.logger.error(
        'Error checking overdue businesses',
        error?.stack ||
          error?.message ||
          JSON.stringify(error),
      );
    }
  }

  // ============================================================
  // PAYMENT CRON
  // ============================================================

  /**
   * Runs every day at 2 AM.
   *
   * Charges FULL monthly renewal price for listings that have
   * already been marked pending for payment.
   *
   * NORMAL  = $15
   * PREMIUM = $30
   *
   * IMPORTANT:
   * This cron is NOT responsible for prorated upgrades.
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleInterval() {
    this.logger.log('Running billing cron...');

    try {
      const businesses =
        await this.businessListingService.getAllPendingForPaymentBusiness({
          page: 1,
          limit: 1000,
        });

      if (!businesses?.data?.length) {
        this.logger.log('No businesses pending for payment');
        return;
      }

      this.logger.log(
        `Found ${businesses.data.length} businesses pending for payment`,
      );

      for (const business of businesses.data) {
        try {
          const user = await this.usersService.findById(
            business.ownerId.toString(),
          );

          if (!user) {
            this.logger.warn(
              `User not found for business ${business._id}`,
            );
            continue;
          }

          if (!user.stripe_customer_id) {
            this.logger.warn(
              `Stripe customer missing for user ${business.ownerId}`,
            );
            continue;
          }

          /**
           * Payment method is required for an off-session payment.
           */
          if (!user.payment_method) {
            this.logger.warn(
              `Payment method missing for user ${business.ownerId}`,
            );
            continue;
          }

          /**
           * FULL MONTHLY RENEWAL PRICE.
           *
           * This should NEVER be used for a mid-cycle upgrade.
           */
          const amount = this.getMonthlyPrice(
            business.listingType,
          );

          this.logger.log(
            `Charging renewal for business ${business._id}: $${amount}`,
          );

          await this.paymentsService.chargeUserOffSessionREST(
            user.stripe_customer_id,
            user.payment_method,
            amount,
            {
              userId: business.ownerId.toString(),
              businessId: business._id.toString(),
              paymentType: 'subscription_renewal',
              listingType: business.listingType,
            },
          );

          this.logger.log(
            `Successfully charged business ${business._id}: $${amount}`,
          );

          /**
           * IMPORTANT:
           *
           * You should update the listing's paymentDate/status here
           * after successful payment.
           *
           * Replace the following with your actual service method
           * if you already have one.
           */

          // await this.businessListingService.updatePaymentAfterSuccessfulCharge(
          //   business._id.toString(),
          //   new Date(),
          // );

        } catch (businessError: any) {
          this.logger.error(
            `Payment failed for business ${business._id}`,
            businessError?.stack ||
              businessError?.message ||
              JSON.stringify(businessError),
          );

          /**
           * Do NOT stop the entire cron when one payment fails.
           * Continue processing the remaining businesses.
           */
          continue;
        }
      }

      this.logger.log('Billing cron completed');
    } catch (error: any) {
      this.logger.error(
        'Error fetching pending businesses',
        error?.stack ||
          error?.message ||
          JSON.stringify(error),
      );
    }
  }

  // ============================================================
  // PRORATED UPGRADE CALCULATION
  // ============================================================

  /**
   * Calculates the amount to charge when upgrading
   * from one monthly plan to another during an active
   * billing period.
   *
   * Example:
   *
   * Basic       = $15
   * Seller      = $30
   * Difference  = $15
   *
   * July 26 -> August 26 = 31 days
   * Upgrade August 19
   * Remaining = 7 days
   *
   * $15 × 7 / 31 = $3.39
   */
  calculateProratedUpgrade(
    currentPlanPrice: number,
    newPlanPrice: number,
    billingStartDate: Date | string,
    upgradeDate: Date | string = new Date(),
  ): number {
    const startDate = new Date(billingStartDate);
    const currentDate = new Date(upgradeDate);

    if (newPlanPrice <= currentPlanPrice) {
      return 0;
    }

    if (currentDate <= startDate) {
      return Number(
        (newPlanPrice - currentPlanPrice).toFixed(2),
      );
    }

    /**
     * Calculate the end of the current billing cycle.
     */
    const cycleEndDate = new Date(startDate);

    cycleEndDate.setMonth(
      cycleEndDate.getMonth() + 1,
    );

    /**
     * If upgrade happens after the billing cycle,
     * there is no prorated upgrade amount.
     */
    if (currentDate >= cycleEndDate) {
      return 0;
    }

    const totalMilliseconds =
      cycleEndDate.getTime() - startDate.getTime();

    const remainingMilliseconds =
      cycleEndDate.getTime() - currentDate.getTime();

    const totalDays =
      totalMilliseconds / (1000 * 60 * 60 * 24);

    const remainingDays =
      remainingMilliseconds / (1000 * 60 * 60 * 24);

    const priceDifference =
      newPlanPrice - currentPlanPrice;

    const proratedAmount =
      priceDifference * (remainingDays / totalDays);

    return Number(proratedAmount.toFixed(2));
  }

  // ============================================================
  // BASIC -> SELLER CENTRAL UPGRADE
  // ============================================================

  /**
   * Calculates the prorated amount for upgrading
   * from Basic ($15) to Seller Central ($30).
   *
   * This method ONLY calculates the amount.
   *
   * The actual Stripe charge should happen inside
   * your upgrade service/controller.
   */
  calculateSellerCentralUpgrade(
    billingStartDate: Date | string,
    upgradeDate: Date | string = new Date(),
  ): number {
    return this.calculateProratedUpgrade(
      this.PLAN_PRICES.NORMAL,
      this.PLAN_PRICES.PREMIUM,
      billingStartDate,
      upgradeDate,
    );
  }
}