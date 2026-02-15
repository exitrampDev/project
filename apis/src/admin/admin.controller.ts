import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { BusinessListingService } from 'src/business-listing/business-listing.service';
import { User } from 'src/common/decorators/user.decorator';
import { NdaService } from 'src/nda/nda.service';
import { UsersService } from 'src/users/users.service';

@Controller('admin')
export class AdminController {

    constructor(private readonly usersService: UsersService,
        private readonly ndaService: NdaService,private readonly businessService: BusinessListingService,) {}

    @UseGuards(JwtAuthGuard)
    @Get('dashboard-counts')
    async getBusinessCount() {
        let userBrokerCount = await this.usersService.getAllUsersBrokerTotal();
        let userIndividulaSellerCount = await this.usersService.getIndividulaSellerTotal();
        let userBuyerCount = await this.usersService.getBuyerTotal();
        let userCount = await this.usersService.getAllUsersTotal();
        let businessCount = await this.businessService.getAllBusinessesTotal();
        let businessLiveCount = await this.businessService.getAllLiveBusinessesTotal();
        let ndaCount = await this.ndaService.getAllNdaTotal();
        return {
            users: userCount,
            sellers: userIndividulaSellerCount,
            brokers: userBrokerCount,
            buyers: userBuyerCount,
            businesses: businessCount,
            businessLiveCount: businessLiveCount,
            ndas: ndaCount
        };
    }
    
    
    
}
