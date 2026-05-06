// src/cron/cron.service.ts
import { Logger, Injectable } from '@nestjs/common';
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule';
import { BusinessListingService } from '../business-listing/business-listing.service';
import { UsersService } from 'src/users/users.service';
import { HttpService } from '@nestjs/axios';
import * as qs from 'qs';
import { differenceInMonths, subMonths } from 'date-fns'
import { PaymentService } from 'src/payment/payment.service';
import { ListingTypes } from 'src/business-listing/dto/create-business.dto';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
   private readonly  businessListingService: BusinessListingService,
    private readonly usersService: UsersService,
    private readonly httpService: HttpService,
    private readonly paymentsService: PaymentService, 
  ) {}


// ===============================================
 /**
   * Runs every day at midnight and mark business as pending for payment if last payment was more than 30 days ago
   */
 @Cron(CronExpression.EVERY_30_SECONDS)
//  @Cron(CronExpression.EVERY_DAY_AT_1AM)
async handleDailyJob() {
  this.logger.log('Running payment check cron----');

  try {
 
  // ----------------------------------------------------------------
    const oneMonthAgo = subMonths(new Date(), 1);

    const businesses =
      await this.businessListingService.findLastPaymentOlderThan(oneMonthAgo);

    this.logger.log(`Found ${businesses.length} overdue businesses`);
     for (const business of businesses) {
      this.logger.log(
        `Business ${business._id} last paid on ${business.paymentDate}`,
      );

    

      if(business.isFirstListing && (business.paymentDate == null || business.paymentDate == undefined) ) {
          const pastDate = new Date(business.createdAt!); 
          const now = new Date();

          const monthDiff = differenceInMonths(now, pastDate);
          if (monthDiff >= 6) {
            await this.businessListingService.markBusinessAsPendingForPayment(business._id.toString());
              }
      }else{
        await this.businessListingService.markBusinessAsPendingForPayment(business._id.toString());
      }

    }
    if (!businesses.length) {
      this.logger.log('No overdue businesses found');
    }

  } catch (error: any) {
    this.logger.error(
        'Error checking overdue businesses',
        error?.stack || error?.message || JSON.stringify(error),
      );
  }
}



  /**
   * Runs every 30 seconds
   */
  // @Cron(CronExpression.EVERY_DAY_AT_2AM)
  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleInterval() {
    this.logger.log('Running billing cron----------------------------------');
    const limit = 500;
        try { 
          // while (true) {
            const businesses = await this.businessListingService.getAllPendingForPaymentBusiness({ page: 1, limit: 1000 });
            if (!businesses.data.length) {
                  this.logger.log('No more businesses to process');
                  return;
                }
          for (const business of businesses.data) {
              const user = await this.usersService.findById(business.ownerId.toString());


            // ----------------------------------------------------------------------------------
          // if(user && user.stripe_customer_id && user.payment_method) {
          if(user && user.stripe_customer_id) {
             let amount = business.listingType == ListingTypes.NORMAL ? 15 : 30; //15 USD for normal listing, 30 USD for premium listing'
  
              
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
                  // }
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

