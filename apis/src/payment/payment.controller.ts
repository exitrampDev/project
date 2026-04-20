import {Headers, Controller, Post, Body, UseGuards, Req, Get, Param, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Types } from 'mongoose';
import { RolesGuard } from 'src/auth/roles.guards';
import { Roles } from 'src/common/decorators/roles.decorator';
import * as crypto from 'crypto';
import { User } from 'src/common/decorators/user.decorator';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { BusinessListingService } from 'src/business-listing/business-listing.service';
import { UsersService } from 'src/users/users.service';
import { RefundRequestDto } from './dto/refund-request.dto';
import { RefundApproveDto } from './dto/refund-approve.dto';
@Controller('payment')
export class PaymentController {
  private readonly webhookSecret = <string> process.env.STRIPE_WEBHOOK_SECRET;
     constructor(private readonly paymentsService: PaymentService,
      private bunisessService: BusinessListingService,
       private readonly usersService: UsersService,

     ) {}

  @Post('create-checkout-session')
  async createCheckout(@Body() body: { amount: number; userId: string }) {
    const session = await this.paymentsService.createCheckoutSession(
      60, 'user_12345',
    );
    console.log('Checkout session created:', session);

    return { url: session.url };
  }

   @Post('create-checkout-session-business-posting')
  async createCheckoutBusinessPosting( @User() user: any ) {
    const session = await this.paymentsService.createCheckoutSession(
      30, user.userId,
    );
    console.log('Checkout session created:', session);

    return { url: session.url };
  }


  // ---------------------------------------------------------payment confirmation webhook
   @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req,
   
  ) {
  
    const raw = req.body; // now a Buffer
    const payload = raw.toString('utf8');
    const event = JSON.parse(payload);


    // temperary bypass signature verification
    // const isValid = this.verifyStripeSignature(raw, signature, this.webhookSecret);
    // if (!isValid) {
    //   console.error('Invalid Stripe signature');
    //   return { received: false };
    // }
  
    console.log('Received Stripe event:', raw.type);
   
    // 2️⃣ Handle Stripe events
    switch (event.type) {
      case 'checkout.session.completed':
        // await this.handleCheckoutCompleted(event.data.object);
        break;

      case 'payment_intent.succeeded':
        console.log('payment_intent.succeeded:-->', event.data);
        await this.handlePaymentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;
    }

    return { received: true };
  }

  async handleCheckoutCompleted(session) {
    // const userId = session.client_reference_id;
    // console.log('Session details:', session.id);
    // console.log('Checkout completed for user:', userId);
    // //get record from db using session id and update status and transaction id in that record
    // const paymentRecord = await this.paymentsService.getBySessionId(session.id);
    // console.log('Payment record found:', paymentRecord);
    // if (paymentRecord) {
    //   paymentRecord.paymentStatus = 'completed';
    //   paymentRecord.transactionDateTime = new Date();
    //   paymentRecord.transactionId = session.payment_intent;
    //   await paymentRecord.save();

    //   //get business id from payment record and update business status to active
    //   this.bunisessService.updateBusinessStatus(paymentRecord.objectId, 'live');

    //   console.log('Payment record updated:', paymentRecord);
    // } else {
    //   console.log('No payment record found for session ID:', session.id);
    // }
    // // TODO: Update your DB here
  }

  async handlePaymentSucceeded(intent) {
    console.log('----->Payment succeeded:--->', intent);

    let paidAmount = intent.amount_received; // Convert to dollars
    let userId = intent.metadata.userId;
    let businessId = intent.metadata.businessId;

    //0. Update User Payment Method Id for future use
    if(intent.payment_method){
      this.usersService.update(userId, { payment_method: intent.payment_method });
    }

    
    // 1. Create payment record
  this.paymentsService.create({
      amount: paidAmount,
      paymentIntentId: intent.id,
      paymentStatus: 'SUCCEEDED',
      referenceId: new Types.ObjectId(businessId),
      paymentFor: intent.metadata.purpose?? 'BUSINESS_CREATION',
    }, new Types.ObjectId(userId));

    // 2. Activate business
    this.bunisessService.updateBusinessStatus(businessId, 'live');
    this.bunisessService.updateBusinessPaymentDate(businessId);

    // const paymentRecord = await this.paymentsService.getBySessionId(intent.id);
    // // console.log('Payment record found:', paymentRecord);
    // if (paymentRecord) {
    //   paymentRecord.paymentStatus = 'completed';
    //   paymentRecord.transactionDateTime = new Date();
    //   paymentRecord.transactionId = intent.id;
    //   await paymentRecord.save();

    //   //get business id from payment record and update business status to active
    //   console.log('Updating business status for business ID:', paymentRecord.objectId.toString());
      

    //   //create payent record in business payment collection
    //     // data.amount = amount;
    //     // data.sessionId = session.id;
    //     // data.objectId  = new Types.ObjectId(dto.businessId);
    //     // this.paymentsService.create(data,userId);

      // console.log('Payment record updated:', paymentRecord);
    // } else {
    //   console.log('No payment record found for session ID:', intent.id);
    // }
    // TODO: Update your DB here
    // Database update
  }

  async handlePaymentFailed(intent) {
    console.log('Payment failed:', intent.id);
    // Database update
  }

  // ---------------------------------------------------------
  //post ki hai 
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto:CreatePaymentDto, @Req() req:any, @User() user: any){
    let data: any = {};
    const userId = new Types.ObjectId(req.user.userId);
    let amount = 0;
  
      if(user.role == 'seller_basic'){
        amount = 30; //30 USD for basic sellers
      }else if(user.role == 'seller_listing'){
        amount = 30; //60 USD for premium sellers
      }
      else if(user.role == 'seller_central'){
        amount = 60; //60 USD for premium sellers
      }
      else if(user.role == 'seller_individual'){
        amount = 30; //60 USD for premium sellers
      }
      else if(user.role == 'seller_broker'){
        amount = 60; //60 USD for premium sellers
      }
    
    const session = await this.paymentsService.createCheckoutSession(
      amount, userId,
    );
   

    data.amount = amount;
    data.sessionId = session.id;
    data.objectId  = new Types.ObjectId(dto.businessId);

    this.paymentsService.create(data,userId);
    console.log('Checkout session created:', session);

    return { url: session.url };
  }

  @Post('inpage-checkout-intent')
  @UseGuards(JwtAuthGuard)
  async inpagePayment(@Body() dto:CreatePaymentDto, @Req() req:any, @User() user: any){
    let data: any = {};
    const userId = new Types.ObjectId(req.user.userId);
    let amount = 0;
  
      if(user.role == 'seller_basic'){
        amount = 30; //30 USD for basic sellers
      }else if(user.role == 'seller_listing'){
        amount = 30; //60 USD for premium sellers
      }else if(user.role == 'seller_central'){
        amount = 30; //60 USD for premium sellers
      }else if(user.role == 'seller_individual'){
        amount = 30; //60 USD for premium sellers
      } else if(user.role == 'seller_broker'){
        amount = 30; //60 USD for premium sellers
      }
    
    const session = await this.paymentsService.createPaymentIntent(
      amount, userId, dto.businessId
    );
   
   
    // data.amount = amount;
    // data.sessionId = session.id;
    // data.objectId  = new Types.ObjectId(dto.businessId);
    // this.paymentsService.create(data,userId);
 
    return { clientSecret: session.clientSecret, amount: session.amount };
    // return { message: 'In-page payment intent endpoint under construction' };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getMyPayments(@Query() query: QueryPaymentDto, @Req() req){
       const userId = new Types.ObjectId(req.user.userId);
       return this.paymentsService.getByUser(req.user, query)
  }

  //admin get 
  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAllPayments(@Req() req: any, @Query() query: any) {
    console.log("JWT payload:", req.user);  // ab show hoga

    return this.paymentsService.findAll(query);
  }

  @Get('all-refund-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAllRefundRequests(@Req() req: any, @Query() query: any) {
    console.log("JWT payload:", req.user);  // ab show hoga

    return this.paymentsService.findAllRefundRequests(query);
  }

  //get id
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getPaymentByID(@Param('id') id:string, @Req() req:any){
    const userId = new Types.ObjectId(req.user.userId);

    const payment = await this.paymentsService.getById(new Types.ObjectId(id));

    if(!payment){
       return { message: 'Payment Not Found'}
    }

    if(payment.userId.toString() !== userId.toString() && !req.user.admin){
      return {message:'Access Denied'}
    }
    return payment
  } 

// ------------------------------------------
  verifyStripeSignature(rawBody: Buffer, sigHeader: string, secret: string) {
  if (!sigHeader) return false;

  const items = sigHeader.split(',');
  const t = items.find(i => i.startsWith('t='))?.split('=')[1];
  const v1 = items.find(i => i.startsWith('v1='))?.split('=')[1];

  if (!t || !v1) return false;

  // Compute HMAC
  const signedPayload = `${t}.${rawBody.toString('utf8')}`;
  const computedSig = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  // Use timing-safe comparison
  return crypto.timingSafeEqual(Buffer.from(computedSig), Buffer.from(v1));
}
// -------------------------------------
@Post('refund-request')
@UseGuards(JwtAuthGuard)
async requestRefund(@Body() dto: RefundRequestDto, @User() user: any) {
  const userId = new Types.ObjectId(user.userId);
  const paymentId = dto.paymentId;
  const reason = dto.reason;
  return this.paymentsService.createRefundRequest(paymentId, userId, reason);
}

@Post('refund-approve')
@UseGuards(JwtAuthGuard)
async approveRefund(@Body() dto: RefundApproveDto, @User() user: any) {
  const userId = new Types.ObjectId(user.userId);
  const paymentId = dto.paymentId;
  const commentByAdmin  = dto.commentByAdmin;
  
  return this.paymentsService.approveRefund(paymentId, userId, commentByAdmin);
}

@Post('refund-reject')
@UseGuards(JwtAuthGuard)
async rejectRefund(@Body() dto: RefundApproveDto, @User() user: any) {
  const userId = new Types.ObjectId(user.userId);
  const paymentId = dto.paymentId;
  const commentByAdmin  = dto.commentByAdmin;
  
  return this.paymentsService.rejectRefund(paymentId, userId, commentByAdmin);
}

}
