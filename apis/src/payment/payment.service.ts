import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as qs from 'qs';

@Injectable()
export class PaymentService {


    async createCheckoutSession(amount: number, userId: string) {
        console.log('Creating checkout session for user:', userId, 'with amount:', amount,process.env.FRONTEND_SUCCESS_URL);
    const payload = qs.stringify({
      'payment_method_types[]': 'card',
      mode: 'payment',

      // line items
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][product_data][name]': 'Wallet Top-Up',
      'line_items[0][price_data][unit_amount]': amount * 100,
      'line_items[0][quantity]': 1,

      // optional metadata
      'metadata[userId]': userId,

      success_url: `${process.env.FRONTEND_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: process.env.FRONTEND_CANCEL_URL,
    });

    const response = await axios.post(
      'https://api.stripe.com/v1/checkout/sessions',
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    return response.data;
  }

}
