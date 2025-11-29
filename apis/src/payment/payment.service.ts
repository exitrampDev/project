import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as qs from 'qs';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { ApiFeatures } from 'src/common/utils/api-features';
import { QuerySellerDto } from 'src/free-seller/dto/query-seller.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';

@Injectable()
export class PaymentService {
     constructor(
        @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
     ){}

    async createCheckoutSession(amount: number, userId: Types.ObjectId|string) {
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
      // 'metadata[userId]': userId,

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
   const { page = 1, limit = 10, search } = query;
  const skip = (page - 1) * limit;

  const baseFilter: any = {
    userId: user.userId
  };

  if (search) {
    baseFilter['$or'] = [
      { transactionId: new RegExp(search, 'i') },
      { message: new RegExp(search, 'i') },
    ];
  }

  const payments = await this.paymentModel.find(baseFilter)
    .populate('userId')       
    .populate({ 
      path: 'objectId',       
      model: 'Business',
      select: 'businessName businessType listingTitle listingDescription'
    })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await this.paymentModel.countDocuments(baseFilter);

  return {
    total,
    page,
    limit,
    data: payments
  };
}

  //find by id
  async getById(id: Types.ObjectId) {
  return this.paymentModel.findById(id)
    .populate({
      path: 'objectId',  
      model: 'Business', 
      select: '_id businessName businessType listingTitle listingDescription' 
    })
    .exec();
}

  //admin get all apyments
  async findAll(query: QueryPaymentDto, user?: any) {
  const { page = 1, limit = 10, search } = query;
  const skip = (page - 1) * limit;

  const baseFilter: any = {};

  if (search) {
    baseFilter['$or'] = [
      { transactionId: new RegExp(search, 'i') },
      { message: new RegExp(search, 'i') },
    ];
  }

  const payments = await this.paymentModel.find(baseFilter)
    .populate('userId')       
    .populate({ 
      path: 'objectId',       
      model: 'Business',
      select: 'businessName businessType listingTitle listingDescription'
    })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await this.paymentModel.countDocuments(baseFilter);

  return {
    total,
    page,
    limit,
    data: payments
  };
}


}
