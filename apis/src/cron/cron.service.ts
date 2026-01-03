// src/cron/cron.service.ts
import { Logger, Injectable } from '@nestjs/common';
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule';
import { BusinessListingService } from '../business-listing/business-listing.service'; // Adjust the import path accordingly



@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);
  private readonly businessListingService: BusinessListingService;

  constructor(businessListingService: BusinessListingService) {
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
            const businesses = await this.businessListingService.findAll({ page: 1, limit: 10 });
            this.logger.log(`Found ${businesses.data.length} businesses`);
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
