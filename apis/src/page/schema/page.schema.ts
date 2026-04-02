import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type PageDocument = HydratedDocument<Page>;

@Schema({ timestamps: true, collection: 'pages' })
export class Page {

  @Prop({ type: String, default: '' })
  pageSlug: string;

  @Prop({ type: String, default: '' })
  pageContent: string;


}

export const PageSchema = SchemaFactory.createForClass(Page);
