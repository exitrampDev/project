import {Headers, Controller, Post, Body, UseGuards, Req, Get, Param, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Types } from 'mongoose';
import { RolesGuard } from 'src/auth/roles.guards';
import { Roles } from 'src/common/decorators/roles.decorator';
import * as crypto from 'crypto';
import { User } from 'src/common/decorators/user.decorator';
@Controller('payment')
export class PaymentController {
  private readonly webhookSecret = <string> process.env.STRIPE_WEBHOOK_SECRET;
     constructor(private readonly paymentsService: PaymentService) {}

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
        await this.handleCheckoutCompleted(event.data.object);
        break;

      case 'payment_intent.succeeded':
        await this.handlePaymentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;
    }

    return { received: true };
  }

  async handleCheckoutCompleted(session) {
    const userId = session.client_reference_id;
    console.log('Session details:', session.id);
    console.log('Checkout completed for user:', userId);

    // TODO: Update your DB here
  }

  async handlePaymentSucceeded(intent) {
    console.log('Payment succeeded:', intent.id);
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

  @Get()
  @UseGuards(JwtAuthGuard)
  async getMyPayments(@Req() req:any, @Query() query: any){
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
}
