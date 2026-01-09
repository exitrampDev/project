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

  @Prop({ default: 'pending', enum: ['pending', 'approved', 'rejected', 'allow-doc-room'] })
  status: string;

  @Prop({ type: Date, default: null })
  sellerResponseOn: Date | null;

  @Prop({ type: String, default: '' })
  cimAccess: string;

  @Prop({ default: 'pending', enum: ['pending', 'approved', 'rejected'] })
  docRoomAccess: string;

  @Prop({ type: String, default: '' })
  message: string;

    /**
   * Base64 encoded buyer signature image
   * Example: data:image/png;base64,iVBORw0KGgoAAAANS...
   */
  @Prop({ type: String, required: false })
  buyerSignature?: string;

  /**
   * Base64 encoded seller signature image
   */
  @Prop({ type: String, required: false })
  sellerSignature?: string;

  /**
   * Base64 encoded agreed NDA document (signed document image)
   */
  @Prop({ type: String, required: false })
  agreedDocument?: string;
}

export const NdaSchema = SchemaFactory.createForClass(Nda);
