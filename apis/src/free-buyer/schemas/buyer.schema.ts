import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BuyerDocument = Buyer & Document;

@Schema({ timestamps: true })
export class Buyer {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop()
  investmentBudget?: string;

  @Prop()
  industryOfInterest?: string;

  @Prop()
  regionOfInterest?: string;

  @Prop()
  businessTypePreferrd?: string;

  @Prop()
  howSoonLookinToAcquire?: string;

  @Prop()
  liquidAssetToSupporPurchase?: string;

  @Prop()
  financingIsPlaced?: string;

  @Prop()
  previousAcquisitionExperience?: string;

  @Prop()
  howDoYouPlanToFundYourPurchase?: string;

  @Prop()
  verificationOfFinancialQualification?: string;

  @Prop()
  briefBackground?: string;

  @Prop()
  willingToSignNDAsDigitally?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ default: false }) 
  isDeleted: boolean;
}

export const BuyerSchema = SchemaFactory.createForClass(Buyer);
