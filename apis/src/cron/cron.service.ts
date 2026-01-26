// src/cron/cron.service.ts
import { Logger, Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { BusinessListingService } from '../business-listing/business-listing.service';
import { UsersService } from 'src/users/users.service';
import { HttpService } from '@nestjs/axios';
import * as qs from 'qs';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly businessListingService: BusinessListingService,
    private readonly usersService: UsersService,
    private readonly httpService: HttpService,
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

   

    const amountInCents = Math.round(60 * 100);

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
}
