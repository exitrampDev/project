import { Injectable, OnModuleInit } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PaymentWebhookService implements OnModuleInit {
  private STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
  private WEBHOOK_URL = process.env.STRIPE_WEBHOOK_URL;

  async onModuleInit() {
    await this.ensureWebhookExists();
  }

  async ensureWebhookExists() {
    try {
      // 1. List existing webhook endpoints
      const list = await axios.get(
        'https://api.stripe.com/v1/webhook_endpoints',
        {
          headers: {
            Authorization: `Bearer ${this.STRIPE_SECRET}`,
          },
        },
      );

      const exists = list.data.data.find(
        (w: any) => w.url === this.WEBHOOK_URL,
      );

      if (exists) {
        console.log('Webhook already exists:', exists.id);
        return;
      }

      // 2. Create webhook
      const params = new URLSearchParams();
      params.append('url', this.WEBHOOK_URL!);
      
      params.append('enabled_events[]', 'checkout.session.completed');
      params.append('enabled_events[]', 'payment_intent.succeeded');
      params.append('enabled_events[]', 'payment_intent.payment_failed');

      const created = await axios.post(
        'https://api.stripe.com/v1/webhook_endpoints',
        params.toString(),
        {
          headers: {
            Authorization: `Bearer ${this.STRIPE_SECRET}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      console.log('Created webhook:', created.data.id);

      // VERY IMPORTANT:
      // Stripe returns a *one-time secret* when creating webhook.
      if (created.data.secret) {
        console.log('Webhook signing secret:', created.data.secret);
        // You must save this secret for signature verification!
      }

    } catch (err: any) {
      console.error(
        'Failed to ensure Stripe webhook:',
        err.response?.data || err.message,
      );
    }
  }
}
