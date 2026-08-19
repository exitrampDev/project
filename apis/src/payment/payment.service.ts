import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import * as qs from 'qs';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  Payment,
  PaymentDocument,
  PaymentPurpose,
  RefundStatus,
} from './schemas/payment.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { UsersService } from 'src/users/users.service';
import { MailService } from 'src/common/mail/mail.service';
import { BusinessListingService } from 'src/business-listing/business-listing.service';
import { ListingTypes } from 'src/business-listing/dto/create-business.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    private readonly usersService: UsersService,
    private readonly businessService: BusinessListingService,
    private readonly mailService: MailService,
  ) {}

  // ---------------------------------------------------------------------------
  // STRIPE CUSTOMER MANAGEMENT
  // ---------------------------------------------------------------------------

  async getOrCreateStripeCustomer(user: { id: string; email: string; name?: string; stripe_customer_id?: string }) {
    if (user.stripe_customer_id) {
      try {
        const existing = await axios.get(
          `https://api.stripe.com/v1/customers/${user.stripe_customer_id}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
            },
          },
        );

        if (!existing.data.deleted) {
          return user.stripe_customer_id;
        }
      } catch (err: any) {
        if (err.response?.status !== 404) {
          throw new InternalServerErrorException('Failed to verify Stripe customer');
        }
      }
    }

    const customerId = await this.createStripeCustomer(user);
    await this.usersService.update(user.id, { stripe_customer_id: customerId });
    return customerId;
  }

  async createStripeCustomer(user: { id: string; email: string; name?: string }) {
    const payload = qs.stringify({
      email: user.email,
      name: user.name,
      'metadata[userId]': user.id,
    });

    try {
      const response = await axios.post(
        'https://api.stripe.com/v1/customers',
        payload,
        {
          headers: {
            Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return response.data.id;
    } catch (err: any) {
      throw new BadRequestException(
        err.response?.data?.error?.message || 'Failed to create Stripe customer',
      );
    }
  }

  // ---------------------------------------------------------------------------
  // CHECKOUT & PAYMENT INTENTS
  // ---------------------------------------------------------------------------

  async createCheckoutSession(amount: number, userId: Types.ObjectId | string) {
    const payload = qs.stringify({
      'payment_method_types[]': 'card',
      mode: 'payment',
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][product_data][name]': 'Business Posting',
      'line_items[0][price_data][unit_amount]': Math.round(amount * 100),
      'line_items[0][quantity]': 1,
      allow_promotion_codes: 'true',
      success_url: `${process.env.FRONTEND_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: process.env.FRONTEND_CANCEL_URL,
    });

    try {
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
    } catch (err: any) {
      throw new BadRequestException(
        err.response?.data?.error?.message || 'Failed to create checkout session',
      );
    }
  }

  async createPaymentIntent(amount: number, userId: Types.ObjectId | string, businessId?: string) {
    const user = await this.usersService.findById(userId);
    const customerId = await this.getOrCreateStripeCustomer(user);

    const business = businessId ? await this.businessService.findOne(businessId) : null;
    if (businessId && !business) {
      throw new BadRequestException('Invalid businessId provided');
    }

    amount = business ? (business.listingType === ListingTypes.PREMIUM ? 30 : 15) : amount;

    const payload = qs.stringify({
      amount: Math.round(amount * 100),
      currency: 'usd',
      customer: customerId,
      setup_future_usage: 'off_session',
      'payment_method_types[0]': 'card',
      'metadata[userId]': userId.toString(),
      'metadata[businessId]': businessId?.toString(),
      'metadata[purpose]': 'BUSINESS_RENEWAL',
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

      return {
        clientSecret: response.data.client_secret,
        id: response.data.id,
        amount: amount,
      };
    } catch (err: any) {
      throw new BadRequestException(
        err.response?.data?.error?.message || 'Failed to create payment intent',
      );
    }
  }

  async createUpgradePaymentIntent(userId: Types.ObjectId | string, businessId?: string) {
    const user = await this.usersService.findById(userId);
    const customerId = await this.getOrCreateStripeCustomer(user);

    const business = businessId ? await this.businessService.findOne(businessId) : null;
    if (businessId && !business) {
      throw new BadRequestException('Invalid businessId provided');
    }

    const BASIC_PRICE = 15;
    const UPGRADED_PRICE = 30;
    const MIN_STRIPE_AMOUNT_USD = 0.50;

    let amount: number;

    if (!business?.paymentDate) {
      // First/Free Listing Upgrade
      amount = UPGRADED_PRICE;
    } else {
      const currentDate = new Date();
      const paymentDate = new Date(business.paymentDate);

      // Extract day anchor (e.g., 28th of every month)
      const anchorDay = paymentDate.getDate();

      // Find the next upcoming renewal date
      let nextBillingDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        anchorDay,
      );

      if (currentDate > nextBillingDate) {
        nextBillingDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          anchorDay,
        );
      }

      // Calculate remaining days in active monthly cycle
      const diffMs = nextBillingDate.getTime() - currentDate.getTime();
      const remainingDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

      const upgradeDifference = UPGRADED_PRICE - BASIC_PRICE; // $15
      const dailyRate = upgradeDifference / 30;

      if (remainingDays > 0 && remainingDays < 30) {
        amount = Number((remainingDays * dailyRate).toFixed(2));
      } else {
        amount = upgradeDifference;
      }

      // Enforce Stripe minimum threshold ($0.50)
      if (amount < MIN_STRIPE_AMOUNT_USD) {
        amount = MIN_STRIPE_AMOUNT_USD;
      }
    }

    const amountInCents = Math.round(amount * 100);

    const payload = qs.stringify({
      amount: amountInCents,
      currency: 'usd',
      customer: customerId,
      setup_future_usage: 'off_session',
      'automatic_payment_methods[enabled]': 'true',
      'metadata[userId]': userId.toString(),
      'metadata[businessId]': businessId?.toString(),
      'metadata[purpose]': PaymentPurpose.BUSINESS_UPGRADE,
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

      return {
        clientSecret: response.data.client_secret,
        id: response.data.id,
        amount: amount,
      };
    } catch (err: any) {
      throw new BadRequestException(
        err.response?.data?.error?.message || 'Failed to create upgrade intent',
      );
    }
  }

  async createSetupIntent(userId: Types.ObjectId | string) {
    const user = await this.usersService.findById(userId);
    const customerId = await this.getOrCreateStripeCustomer(user);

    const payload = qs.stringify({
      customer: customerId,
      usage: 'off_session',
    });

    try {
      const response = await axios.post(
        'https://api.stripe.com/v1/setup_intents',
        payload,
        {
          headers: {
            Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return {
        clientSecret: response.data.client_secret,
      };
    } catch (err: any) {
      throw new BadRequestException(
        err.response?.data?.error?.message || 'Failed to create setup intent',
      );
    }
  }

  // ---------------------------------------------------------------------------
  // OFF-SESSION RECURRING CHARGES
  // ---------------------------------------------------------------------------

  async chargeUserOffSessionREST(
    stripe_customer_id: string,
    payment_method: string,
    amount: number,
    metadata: Record<string, string>,
  ) {
    payment_method = await this.getUsablePaymentMethod(stripe_customer_id);

    if (!payment_method) {
      throw new BadRequestException('No valid payment method found for customer');
    }

    const payload = qs.stringify({
      amount: Math.round(amount * 100),
      currency: 'usd',
      customer: stripe_customer_id,
      payment_method: payment_method,
      off_session: true,
      confirm: true,
      'metadata[userId]': metadata.userId,
      'metadata[businessId]': metadata.businessId,
      'metadata[purpose]': 'BUSINESS_RENEWAL',
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
      const stripeError = err.response?.data?.error;
      if (stripeError?.code === 'authentication_required') {
        throw new BadRequestException('Card requires 3DS re-authentication');
      }
      throw new BadRequestException(stripeError?.message || 'Stripe charge failed');
    }
  }

  async getUsablePaymentMethod(customerId: string) {
    try {
      const customer = await axios.get(
        `https://api.stripe.com/v1/customers/${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          },
        },
      );

      const defaultPM = customer.data.invoice_settings?.default_payment_method;
      if (defaultPM) return defaultPM;

      const pmList = await axios.get(
        `https://api.stripe.com/v1/payment_methods`,
        {
          params: { customer: customerId, type: 'card' },
          headers: {
            Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          },
        },
      );

      if (pmList.data.data.length === 0) {
        throw new BadRequestException('No payment methods found');
      }

      return pmList.data.data[0].id;
    } catch (err: any) {
      throw new BadRequestException('Failed to retrieve usable payment method');
    }
  }

  // ---------------------------------------------------------------------------
  // MONGO DATABASE QUERIES
  // ---------------------------------------------------------------------------

  async create(dto: CreatePaymentDto, userId: Types.ObjectId) {
    const payment = new this.paymentModel({
      ...dto,
      userId,
    });
    return payment.save();
  }

  async getByUser(user: { userId: string }, query: QueryPaymentDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const baseFilter: any = {
      userId: new Types.ObjectId(user.userId),
    };

    if (search) {
      baseFilter['$or'] = [
        { transactionId: new RegExp(search, 'i') },
        { message: new RegExp(search, 'i') },
      ];
    }

    const [payments, total] = await Promise.all([
      this.paymentModel
        .find(baseFilter)
        .lean()
        .populate('userId')
        .populate({
          path: 'referenceId',
          model: 'Business',
          select: 'businessName businessType listingTitle listingDescription',
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.paymentModel.countDocuments(baseFilter),
    ]);

    const formattedPayments = payments.map((payment) => ({
      ...payment,
      amount: payment.amount / 100,
    }));

    return {
      total,
      page,
      limit,
      data: formattedPayments,
    };
  }

  async getById(id: Types.ObjectId | string) {
    return this.paymentModel
      .findById(id)
      .populate({
        path: 'referenceId',
        model: 'Business',
        select: '_id businessName businessType listingTitle listingDescription',
      })
      .exec();
  }

  async getBySessionId(id: string) {
    return this.paymentModel.findOne({ sessionId: id }).exec();
  }

  async findAll(query: QueryPaymentDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const baseFilter: any = {};

    if (search) {
      baseFilter['$or'] = [
        { transactionId: new RegExp(search, 'i') },
        { message: new RegExp(search, 'i') },
      ];
    }

    const [payments, total] = await Promise.all([
      this.paymentModel
        .find(baseFilter)
        .populate('userId')
        .populate({
          path: 'referenceId',
          model: 'Business',
          select: 'businessName businessType listingTitle listingDescription status',
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.paymentModel.countDocuments(baseFilter),
    ]);

    return { total, page, limit, data: payments };
  }

  // ---------------------------------------------------------------------------
  // REFUND MANAGEMENT
  // ---------------------------------------------------------------------------

  async findAllRefundRequests(query: QueryPaymentDto) {
    const { page = 1, limit = 10000, search } = query;
    const skip = (page - 1) * limit;

    const baseFilter: any = {
      refundStatus: { $ne: RefundStatus.NOT_REQUESTED },
    };

    if (search) {
      baseFilter['$or'] = [
        { transactionId: new RegExp(search, 'i') },
        { message: new RegExp(search, 'i') },
      ];
    }

    const [payments, total] = await Promise.all([
      this.paymentModel
        .find(baseFilter)
        .populate('userId')
        .populate({
          path: 'referenceId',
          model: 'Business',
          select: 'businessName businessType listingTitle listingDescription',
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.paymentModel.countDocuments(baseFilter),
    ]);

    return { total, page, limit, data: payments };
  }

  async createRefundRequest(paymentId: string, userId: Types.ObjectId, reason: string) {
    const payment = await this.paymentModel.findOne({
      _id: paymentId,
      userId,
    });

    if (!payment) {
      throw new NotFoundException('Payment not found or access denied');
    }

    if (payment.refundStatus !== RefundStatus.NOT_REQUESTED) {
      throw new ConflictException(
        `A refund request already exists with status "${payment.refundStatus}"`,
      );
    }

    return this.paymentModel.findByIdAndUpdate(
      payment._id,
      {
        refundReason: reason,
        refundStatus: RefundStatus.PENDING,
        refundRequestedAt: new Date(),
      },
      { new: true },
    );
  }

  async approveRefund(paymentId: string, userId: Types.ObjectId, commentByAdmin: string) {
    const payment = await this.paymentModel.findById(paymentId);

    if (!payment) {
      throw new NotFoundException('Payment not found or access denied');
    }

    if (payment.refundStatus !== RefundStatus.PENDING) {
      throw new ConflictException(
        `This payment's refund status is "${payment.refundStatus}", not "PENDING"`,
      );
    }

    const user = await this.usersService.findById(payment.userId.toString());
    if (user) {
      await this.mailService.sendMail(user.email, 'Refund Approved', 'generalMessage', {
        receiverName: user.first_name ? user.first_name : 'User',
        message: 'Your refund request has been approved.',
      });
    }

    return this.paymentModel.findByIdAndUpdate(
      payment._id,
      {
        refundStatus: RefundStatus.APPROVED,
        refundResolvedAt: new Date(),
        refundCommentByAdmin: commentByAdmin,
      },
      { new: true },
    );
  }

  async rejectRefund(paymentId: string, userId: Types.ObjectId, commentByAdmin: string) {
    const payment = await this.paymentModel.findById(paymentId);

    if (!payment) {
      throw new NotFoundException('Payment not found or access denied');
    }

    if (payment.refundStatus !== RefundStatus.PENDING) {
      throw new ConflictException(
        `This payment's refund status is "${payment.refundStatus}", not "PENDING"`,
      );
    }

    const user = await this.usersService.findById(payment.userId.toString());
    if (user) {
      await this.mailService.sendMail(user.email, 'Refund Rejected', 'generalMessage', {
        receiverName: user.first_name ? user.first_name : 'User',
        message: 'Your refund request has been rejected.',
      });
    }

    return this.paymentModel.findByIdAndUpdate(
      payment._id,
      {
        refundStatus: RefundStatus.REJECTED,
        refundResolvedAt: new Date(),
        refundCommentByAdmin: commentByAdmin,
      },
      { new: true },
    );
  }
}