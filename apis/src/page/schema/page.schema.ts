import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type PageDocument = HydratedDocument<Page>;

@Schema({ timestamps: true, collection: 'pages' })
export class Page {

  @Prop({ type: String, default: '' })
  pageSlug!: string;

  @Prop({ type: String, default: '' })
  pageContent!: string;

  @Prop({ type: String, default: '' })
  title!: string;

  @Prop({ type: [String], default: [] })
  categories!: string[];

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ type: String, default: '' })
  tool!: string;

  @Prop({ type: String, default: '' })
  summary!: string;

}

export const PageSchema = SchemaFactory.createForClass(Page);
