import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type BlogDocument = HydratedDocument<Blog>;

@Schema({ timestamps: true, collection: 'blogs' })
export class Blog {

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

  @Prop({ type: String, default: '' })
  author!: string;

}

export const BlogSchema = SchemaFactory.createForClass(Blog);
