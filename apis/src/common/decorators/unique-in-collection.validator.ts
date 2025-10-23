// common/decorators/unique-in-collection.validator.ts
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';

interface UniqueInCollectionOptions {
  collection: string;
  field: string;
  message?: string;
}

@ValidatorConstraint({ async: true })
@Injectable()
export class UniqueInCollectionConstraint implements ValidatorConstraintInterface {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async validate(value: any, args: ValidationArguments) {
    const [options] = args.constraints as [UniqueInCollectionOptions];
    if (!value) return true; // Skip if value is empty (for @IsOptional())

    const collection = this.connection.collection(options.collection);

    // 👇 THIS IS THE IMPORTANT PART 👇
    const currentDocId = (args.object as any)?._id; // your DTO or entity instance
    const query: any = { [options.field]: value };

    if (currentDocId && Types.ObjectId.isValid(currentDocId)) {
      // Exclude current document when updating
      query._id = { $ne: new Types.ObjectId(currentDocId) };
    }

    const exists = await collection.findOne(query);
    return !exists;
  }

  defaultMessage(args: ValidationArguments) {
    const [options] = args.constraints as [UniqueInCollectionOptions];
    return options.message || `${options.field} must be unique`;
  }
}

// Factory function for decorator
export function UniqueInCollection(options: UniqueInCollectionOptions, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [options],
      validator: UniqueInCollectionConstraint,
    });
  };
}
