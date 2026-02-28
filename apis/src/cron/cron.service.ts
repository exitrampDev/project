// src/cron/cron.service.ts
import { Logger, Injectable } from '@nestjs/common';
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule';
import { BusinessListingService } from '../business-listing/business-listing.service';
import { UsersService } from 'src/users/users.service';
import { HttpService } from '@nestjs/axios';
import * as qs from 'qs';
import { subMonths } from 'date-fns'
import { PaymentService } from 'src/payment/payment.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);
  private readonly businessListingService: BusinessListingService;

  constructor(
   businessListingService: BusinessListingService,
    private readonly usersService: UsersService,
    private readonly httpService: HttpService,
    private readonly paymentsService: PaymentService, 
  ) {}

  /**
   * Runs every 30 seconds (example)
   * In real systems use EVERY_DAY_AT_MIDNIGHT or hourly
   */
  // @Interval(10000)
  // async handleInterval() {
  //   this.logger.log('Running billing cron job');

  //   try {
  //     const businesses = await this.businessListingService.findAll({
  //       page: 1,
  //       limit: 10,
  //     });

  //     for (const business of businesses.data) {
  //       try {
  //         await this.chargeBusinessOwner(business);
  //       } catch (err) {
  //         this.logger.error(
  //           `Failed to charge business ${business.id}`,
  //           err?.response?.data || err.message,
  //         );
  //       }
  //     }
  //   } catch (error) {
  //     this.logger.error('Error fetching businesses', error);
  //   }
  // }

  /**
   * Charges a business owner off-session using Stripe REST API
   */
  private async chargeBusinessOwner(business: any) {
    console.log('Charging business owner for business:', business._id);
    const user = await this.usersService.findById(business.ownerId);

    if (!user?.stripe_customer_id || !user?.payment_method) {
      this.logger.warn(
        `Skipping user ${(business.ownerId)} — missing Stripe customer or payment method`,
      );
      return;
    }

   

    const amountInCents = Math.round(30 * 100);

    const payload = qs.stringify({
      amount: amountInCents,
      currency: 'usd',
      customer: user?.stripe_customer_id,
      payment_method: user?.payment_method,
      off_session: true,
      confirm: true,
      'metadata[userId]': user?.id,
      'metadata[businessId]': business._id.toString(),
      'metadata[purpose]': 'Business Listing Renewal',

    });

    const response = await this.httpService.axiosRef.post(
      'https://api.stripe.com/v1/payment_intents',
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    this.logger.log(
      `PaymentIntent ${response.data.id} created for business ${business.id}`,
    );

    // DO NOT mark payment as successful here
    // Webhook payment_intent.succeeded is the source of truth
  }
// ===============================================
 /**
   * Runs every day at midnight
   */
 @Cron(CronExpression.EVERY_30_MINUTES)
async handleDailyJob() {
  this.logger.log('Running payment check cron');

  try {
    // 1 Calculate date 1 month ago
   const oneMonthAgo = subMonths(new Date(), 1);

    // 2 Fetch businesses whose lastPaymentDate < oneMonthAgo and live
    const businesses =
      await this.businessListingService.findLastPaymentOlderThan(
        oneMonthAgo,
      );

    // 3 Log them
    for (const business of businesses) {
      this.logger.log(
        `----->Business ${business._id} last paid on ${business.paymentDate}`,
      );
      this.businessListingService.markBusinessAsPendingForPayment((business._id as any).toString());
    }

    if (!businesses.length) {
      this.logger.log('No overdue businesses found');
    }
  } catch (error) {
    this.logger.error('Error checking overdue businesses', error);
  }
}

  /**
   * Runs every 10 minutes
//    */
//   @Cron(CronExpression.EVERY_10_MINUTES)
//   handleEveryTenMinutes() {
//     this.logger.log('Running job every 10 minutes');
//   }

  /**
   * Custom cron expression (every day at 3 AM)
   */
//   @Cron('0 3 * * *')
//   handle3AMJob() {
//     this.logger.log('Running 3 AM job');
//   }

  /**
   * Runs every 30 seconds
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleInterval() {
    this.logger.log('Running billing cron');
    const limit = 10;
        try { while (true) {
            const businesses = await this.businessListingService.getAllPendingForPaymentBusiness({ page: 1, limit: 1000 });
            if (!businesses.data.length) {
                  this.logger.log('No more businesses to process');
                  break;
                }
          for (const business of businesses.data) {
              const user = await this.usersService.findById(business.ownerId.toString());


            // ----------------------------------------------------------------------------------
          if(user && user.stripe_customer_id && user.payment_method) {
             let amount = 30;
  
              // if(user.user_type == 'seller_basic'){
              //   amount = 30; //30 USD for basic sellers
              // }else if(user.user_type == 'seller_listing'){
              //   amount = 30; //60 USD for premium sellers
              // }
              // else if(user.user_type == 'seller_central'){
              //   amount = 60; //60 USD for premium sellers
              // }

              // await this.chargeBusinessOwner(business);
              
            await this.paymentsService.chargeUserOffSessionREST(
                        user.stripe_customer_id,
                        user.payment_method,
                        amount,
                        {
                          userId: business.ownerId.toString(),
                          businessId: business._id.toString(),
                        },
                      );
            this.logger.log(`Found ${businesses.data.length} businesses`);
                    }
                    }
                  }
        } catch (error) {
            this.logger.error('Error fetching businesses', error);
        }
    }
  

  /**
   * Runs once after 5 seconds on app start
   */
  //   @Timeout(5000)
  //   handleStartupTask() {
  //     this.logger.log('Startup task executed');
  //   }
}

// https://github.com/exitrampDev/project/blob/954d27ddfded3d6bbe645e5f1e52c6f1235a42b4/apis/src/cron/cron.service.ts

