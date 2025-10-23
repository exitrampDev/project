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

@ValidatorConstraint({ async: true })
@Injectable()
export class BusinessExistsConstraint implements ValidatorConstraintInterface {
  constructor(@InjectModel(Business.name) private businessModel: Model<Business>) {}

  async validate(businessId: string) {
    if (!businessId) return false;
    if (!mongoose.Types.ObjectId.isValid(businessId)) return false;

    const objectId = new mongoose.Types.ObjectId(businessId);
    const exists = await this.businessModel.exists({ _id: objectId });
    return !!exists;
  }
}

export function BusinessExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: BusinessExistsConstraint,
    });
  };
}
