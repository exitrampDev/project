import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as qs from 'qs';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { ApiFeatures } from 'src/common/utils/api-features';
import { QuerySellerDto } from 'src/free-seller/dto/query-seller.dto';

@Injectable()
export class PaymentService {
     constructor(
        @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
     ){}

    async createCheckoutSession(amount: number, userId: string) {
        console.log('Creating checkout session for user:', userId, 'with amount:', amount,process.env.FRONTEND_SUCCESS_URL);
    const payload = qs.stringify({
      'payment_method_types[]': 'card',
      mode: 'payment',

      // line items
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][product_data][name]': 'Business Posting',
      'line_items[0][price_data][unit_amount]': amount * 100,
      'line_items[0][quantity]': 1,
      'allow_promotion_codes': 'true',

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

  //create payment 
  async create(dto:CreatePaymentDto, userId: Types.ObjectId){
     const payment = new this.paymentModel({
      ...dto,
      userId
     });
     return payment.save();
  }
  //get payment for specific user
  async getByUser(user: any, query: any) {
  const userId = user.userId || user.sub || user.id;

  const baseFilter: any = {};
  if (userId) {
    baseFilter.userId = new Types.ObjectId(userId);
  }

  const features = new ApiFeatures(this.paymentModel);
  return features.paginateAndFilter({
    ...query,
    searchFields: ['transactionId', 'message'], // searchable fields
    baseFilter,
  });
}

  //find by id
  async getById(id: Types.ObjectId){
    return this.paymentModel.findById(id);
  }

  //admin get all apyments
  async findAll(query: QuerySellerDto, user?:any) {
     console.log("🔥 incoming query:", query);
  const baseFilter: any = {}; 

  const features = new ApiFeatures(this.paymentModel);
  return features.paginateAndFilter({
    ...query,
    searchFields: ['transactionId', 'message'], 
    baseFilter,
  });
}

}
