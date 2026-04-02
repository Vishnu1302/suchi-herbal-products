import mongoose, { Schema, Document } from "mongoose";

export type ProductCategory =
  | "powder"
  | "oil"
  | "capsule"
  | "tea"
  | "extract"
  | "herb"
  | "other";

export interface ProductDocument extends Document {
  name: string;
  slug: string;
  description: string;
  ingredients: string;
  usage: string;
  benefits?: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: ProductCategory;
  inStock: boolean;
  stockCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    ingredients: { type: String, required: true },
    usage: { type: String, required: true },
    benefits: { type: String },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    images: { type: [String], default: [] },
    category: {
      type: String,
      required: true,
      enum: ["powder", "oil", "capsule", "tea", "extract", "herb", "other"],
    },
    inStock: { type: Boolean, default: true },
    stockCount: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
  },
);

const ProductModel = mongoose.model<ProductDocument>("Product", ProductSchema);

export default ProductModel;
