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
    
    
    @UseGuards(JwtAuthGuard)
    @Get('seller-dashboard-counts')
    async getSellerDashboardCount(@User() user: any) {
        //listing total count
        //nda total count
        //cim shared
        //buyer views count
     
        let listinCount = await this.businessService.getAllMyBusinessesTotal(user.userId);
        let ndaCount = await this.ndaService.getAllNdaTotalOnMyListing(user.userId);
        let cimSharedCount = await this.ndaService.getAllApprovedNdaTotal(user.userId);
        let buyerViewsCount = await this.businessService.getAllBuyerViewsOnMyListing(user.userId);
        return {
            listinCount: listinCount,
            ndas: ndaCount,
            cimSharedCount: cimSharedCount,
            buyerViewsCount: buyerViewsCount
        };
    }
    
}
