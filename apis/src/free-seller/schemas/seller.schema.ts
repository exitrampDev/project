import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SellerDocument = Seller & Document;

@Schema({ 
  timestamps: true,
  collection: 'sellerProfile'   
})
export class Seller {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  role: string; // investment range

  @Prop({ required: true })
  companyName: string;

  @Prop()
  companyWebsite?: string;

  @Prop({ required: true })
  businessType: string;

  @Prop()
  city?: string;

  @Prop()
  state?: string;

  @Prop()
  country?: string;

  @Prop()
  zipCode?: string;

  @Prop({ required: true })
  yearsInOperation: string;

  // Files
  @Prop()
  companyLogo?: string; 

  @Prop()
  teamSummaryDocument?: string; 

  @Prop()
  image?: string; // uploaded images (profile, etc.)
  
  @Prop()
  pdfFile?: string; // uploaded PDFs

  @Prop()
  profitAndLossFile?: string;

  @Prop()
  balanceSheetFile?: string;

  @Prop()
  threeYearTaxReturnFile?: string;

  @Prop()
  ownerShipCaptableFile?: string;

  @Prop({ default: 'draft' })
  status: string;

  @Prop()
  companyOverview?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const SellerSchema = SchemaFactory.createForClass(Seller);
