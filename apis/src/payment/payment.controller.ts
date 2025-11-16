import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
     constructor(private readonly paymentsService: PaymentService) {}

  @Post('create-checkout-session')
  async createCheckout(@Body() body: { amount: number; userId: string }) {
    const session = await this.paymentsService.createCheckoutSession(
      body.amount,
      body.userId,
    );

    return { url: session.url };
  }
}
