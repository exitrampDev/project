import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { BusinessListingService } from "src/business-listing/business-listing.service";

@Injectable()
export class BusinessOwnerGuard implements CanActivate {
  constructor(private readonly businessService: BusinessListingService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // set by JwtAuthGuard
    const businessId = request.params.id;
    console.log("BusinessOwnerGuard: user =", user, "businessId =", businessId);
    const isOwner = await this.businessService.isOwner(
      user.userId,
      businessId,
    );

    if (!isOwner) {
      throw new ForbiddenException('You are not the business owner');
    }

    return true;
  }
}
