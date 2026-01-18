// src/cron/cron.service.ts
import { Logger, Injectable } from '@nestjs/common';
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule';
import { BusinessListingService } from '../business-listing/business-listing.service'; // Adjust the import path accordingly
import { PaymentService } from 'src/payment/payment.service';
import { UsersService } from 'src/users/users.service';



@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);
  private readonly businessListingService: BusinessListingService;

  constructor(
    private readonly paymentsService: PaymentService, 
    private readonly usersService: UsersService,
    businessListingService: BusinessListingService
  
  ) {
    this.businessListingService = businessListingService;
  }

  /**
   * Runs every day at midnight
   */
//   @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
//   handleDailyJob() {
//     this.logger.log('Running daily cron job');
//   }

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
  @Interval(30000)
  async handleInterval() {
        try {
            const businesses = await this.businessListingService.findAll({ page: 1, limit: 10000 });

          for (const business of businesses.data) {
              const user = await this.usersService.findById(business.ownerId.toString());


            // ----------------------------------------------------------------------------------
          if(user && user.stripe_customer_id && user.payment_method) {
             let amount = 0;
  
              if(user.user_type == 'seller_basic'){
                amount = 30; //30 USD for basic sellers
              }else if(user.user_type == 'seller_listing'){
                amount = 30; //60 USD for premium sellers
              }
              else if(user.user_type == 'seller_central'){
                amount = 60; //60 USD for premium sellers
              }
              
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
