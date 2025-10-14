import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NdaDocument = Nda & Document & { 
  createdAt: Date;
  updatedAt: Date;
};

@Schema({ timestamps: true, collection: 'ndaSubmissions' })
export class Nda {
  @Prop({ type: Types.ObjectId, ref: 'Business', required: true })
  businessId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  submittedBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })  
  businessOwnerId?: Types.ObjectId;

  @Prop({ default: 'pending', enum: ['pending', 'approved', 'rejected'] })
  status: string;

  @Prop({ type: Date, default: null })
  sellerResponseOn: Date | null;

  @Prop({ type: String, default: '' })
  cimAccess: string;

  @Prop({ type: String, default: '' })
  message: string;
}

export const NdaSchema = SchemaFactory.createForClass(Nda);
