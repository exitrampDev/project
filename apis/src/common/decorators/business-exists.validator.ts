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

  async validate(businessId: string, args: ValidationArguments) {
    const businessObjectId = new mongoose.Types.ObjectId(businessId);
    if (!businessObjectId) return false;
     //  Check if it's a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(businessObjectId)) {
        return false;
    }
    const exists = await this.businessModel.exists({ _id: businessObjectId });
    return !!exists;
  }

  defaultMessage(args: ValidationArguments) {
    return `Business with ID "${args.value}" does not exist`;
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
