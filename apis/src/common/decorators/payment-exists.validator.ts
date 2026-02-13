// src/common/validators/business-exists.validator.ts
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Business } from 'src/business-listing/schemas/business.schema';
import { Payment } from 'src/payment/schemas/payment.schema';

@ValidatorConstraint({ async: true })
@Injectable()
export class PaymentExistsValidator implements ValidatorConstraintInterface {
  constructor(@InjectModel(Payment.name) private paymentModel: Model<Payment>) {}

  async validate(paymentId: string) {
    if (!paymentId) return false;
    if (!mongoose.Types.ObjectId.isValid(paymentId)) return false;

    const objectId = new mongoose.Types.ObjectId(paymentId);
    const exists = await this.paymentModel.exists({ _id: objectId });
    return !!exists;
  }
}

export function PaymentExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: PaymentExistsValidator,
    });
  };
}
