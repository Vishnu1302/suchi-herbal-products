import mongoose, { Schema, Document, Types } from "mongoose";
import { ProductCategory } from "./product.model";
import { CATEGORY_SLUGS } from "../config/categories";

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export interface InventoryDocument extends Document {
  productId: Types.ObjectId;
  productName: string;
  sku: string;
  image: string;
  category: ProductCategory;
  stock: number;
  reserved: number;
  available: number;
  lowStockThreshold: number;
  status: StockStatus;
  lastUpdated: Date;
}

const InventorySchema = new Schema<InventoryDocument>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    image: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: CATEGORY_SLUGS,
    },
    stock: { type: Number, required: true, default: 0, min: 0 },
    reserved: { type: Number, required: true, default: 0, min: 0 },
    available: { type: Number, required: true, default: 0, min: 0 },
    lowStockThreshold: { type: Number, required: true, min: 0, default: 10 },
    status: {
      type: String,
      required: true,
      enum: ["in-stock", "low-stock", "out-of-stock"],
    },
    lastUpdated: { type: Date, required: true, default: Date.now },
  },
  { timestamps: false },
);

const InventoryModel = mongoose.model<InventoryDocument>(
  "Inventory",
  InventorySchema,
);

export default InventoryModel;
