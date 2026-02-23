import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import * as qs from 'qs';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Payment, PaymentDocument, RefundStatus } from './schemas/payment.schema';
import { ApiFeatures } from 'src/common/utils/api-features';
import { QuerySellerDto } from 'src/free-seller/dto/query-seller.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class PaymentService {
     constructor(
        @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
        private readonly usersService: UsersService,
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

  // ------------------
  async getOrCreateStripeCustomer(user) {
  if (user.stripe_customer_id) {
    return user.stripe_customer_id;
  }

  const customerId = await this.createStripeCustomer(user);

  // Persist customerId in DB
  await this.usersService.update(user.id, { stripe_customer_id: customerId });

  return customerId;
}
  async createStripeCustomer(user: {
  id: string;
  email: string;
  name?: string;
}) {
  const payload = qs.stringify({
    email: user.email,
    name: user.name,
    'metadata[userId]': user.id,
  });

  const response = await axios.post(
    'https://api.stripe.com/v1/customers',
    payload,
    {
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return response.data.id; // cus_...
}
  async  createPaymentIntent(amount: number, userId: any, businessId?: string) {
    let user = await this.usersService.findById(userId);
    const customerId = await this.getOrCreateStripeCustomer(user);
    const payload = qs.stringify({
      amount: Math.round(amount * 100),
      currency: 'usd',
      customer: customerId,
      setup_future_usage: 'off_session',
      // 'payment_method_types[0]': 'card',
      automatic_payment_methods: { enabled: true },
      //  'automatic_payment_methods[enabled]': true,
      'metadata[userId]': userId.toString(),
      'metadata[businessId]': businessId?.toString(),
      'metadata[purpose]': 'Business Posting',
    
   });

  const response = await axios.post(
    'https://api.stripe.com/v1/payment_intents',
    payload,
    {
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  console.log('Payment Intent created:', response.data.client_secret);

  return {
    clientSecret: response.data.client_secret,
    id:response.data.id
  };
}
  //create payment 
  async create(dto:any, userId: Types.ObjectId){
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
    userId: new Types.ObjectId(user.userId)
  };

  if (search) {
    baseFilter['$or'] = [
      { transactionId: new RegExp(search, 'i') },
      { message: new RegExp(search, 'i') },
    ];
  }

  let payments = await this.paymentModel.find(baseFilter)
    .populate('userId')       
    .populate({ 
      path: 'referenceId',       
      model: 'Business',
      select: 'businessName businessType listingTitle listingDescription'
    })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await this.paymentModel.countDocuments(baseFilter);
  payments = payments.map(payment=>{
    payment.amount = payment.amount / 100;
    return payment;
  });

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
      path: 'referenceId',  
      model: 'Business', 
      select: '_id businessName businessType listingTitle listingDescription' 
    })
    .exec();
}

  async getBySessionId(id: Types.ObjectId) {
    return this.paymentModel.findOne({ sessionId: id }).exec();
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
      path: 'referenceId',       
      model: 'Business',
      select: 'businessName businessType listingTitle listingDescription status'
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

  //admin get all apyments
  async findAllRefundRequests(query: QueryPaymentDto, user?: any) {
  const { page = 1, limit = 10000, search } = query;
  const skip = (page - 1) * limit;

  const baseFilter: any = {"refundStatus": { $ne: RefundStatus.NOT_REQUESTED } };

  if (search) {
    baseFilter['$or'] = [
      { transactionId: new RegExp(search, 'i') },
      { message: new RegExp(search, 'i') },
    ];
  }

  const payments = await this.paymentModel.find(baseFilter)
    .populate('userId')       
    .populate({ 
      path: 'referenceId',       
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

// -----------------------------------------
async chargeUserOffSessionREST(
  stripe_customer_id: string,
  payment_method: string,
  amount: number,
  metadata: Record<string, string>,
) {
  const payload = qs.stringify({
    amount: Math.round(amount * 100),
    currency: 'usd',
    customer: stripe_customer_id,
    payment_method: payment_method,
    off_session: true,
    confirm: true,
    'metadata[userId]': metadata.userId,
    'metadata[businessId]': metadata.businessId,
    'metadata[purpose]': 'Subscription Charge',
  });

  try {
    const response = await axios.post(
      'https://api.stripe.com/v1/payment_intents',
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    return response.data;
  } catch (err: any) {
    // Stripe error format
    const stripeError = err.response?.data?.error;

    if (stripeError?.code === 'authentication_required') {
      // Card needs 3DS re-authentication
      throw new Error('Authentication required');
    }

    throw new Error(stripeError?.message || 'Stripe charge failed');
  }
}

async createRefundRequest(
  paymentId: string,
  userId: Types.ObjectId,
  reason: string,
) {
  console.log('Creating refund request for paymentId:', paymentId, 'userId:', userId);
  const payment = await this.paymentModel.findOne({
    _id: paymentId,
    userId,
  });

  if (!payment) {
    throw new NotFoundException('Payment not found or access denied');
  }

  
  if (payment.refundStatus != RefundStatus.NOT_REQUESTED) {
    throw new ConflictException(
      `A refund request for this payment already exists with status "${payment.refundStatus}"`,
    );
  }


  const refundRequest = await this.paymentModel.findByIdAndUpdate(
    payment._id,
    {
      refundReason: reason,
      refundStatus: RefundStatus.PENDING,
      refundRequestedAt: new Date(),
    },
    { new: true }
  );
  
  return refundRequest;
}

async approveRefund(
  paymentId: string,
  userId: Types.ObjectId,
  commentByAdmin: string,
) {
  console.log('Approving refund for paymentId:', paymentId, 'userId:', userId);
  const payment = await this.paymentModel.findOne({
    _id: paymentId,    
  });

  if (!payment) {
    throw new NotFoundException('Payment not found or access denied');
  }

  if (payment.refundStatus !== RefundStatus.PENDING) {
    throw new ConflictException(
      `This payment's refund status is "${payment.refundStatus}", not "PENDING"`,
    );
  }

  return this.paymentModel.findByIdAndUpdate(
    payment._id,
    {
      refundStatus: RefundStatus.APPROVED,
      refundResolvedAt: new Date(),
      refundCommentByAdmin: commentByAdmin,
    },
    { new: true }
  );
}

async rejectRefund(
  paymentId: string,
  userId: Types.ObjectId,
  commentByAdmin: string,
) {
  console.log('Rejecting refund for paymentId:', paymentId, 'userId:', userId);
  const payment = await this.paymentModel.findOne({
    _id: paymentId,    
  });

  if (!payment) {
    throw new NotFoundException('Payment not found or access denied');
  }

  if (payment.refundStatus !== RefundStatus.PENDING) {
    throw new ConflictException(
      `This payment's refund status is "${payment.refundStatus}", not "PENDING"`,
    );
  }

  return this.paymentModel.findByIdAndUpdate(
    payment._id,
    {
      refundStatus: RefundStatus.REJECTED,
      refundResolvedAt: new Date(),
      refundCommentByAdmin: commentByAdmin,
    },
    { new: true }
  );
}
}
