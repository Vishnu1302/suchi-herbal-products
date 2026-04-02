import mongoose, { Schema, Document } from "mongoose";

// ─── Sub-document types ──────────────────────────────────────────────────────

export interface OrderItemDoc {
  productId: string;
  productName: string;
  image: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface AddressDoc {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  phone: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

// ─── Main document interface ─────────────────────────────────────────────────

export interface OrderDocument extends Document {
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: AddressDoc;
  items: OrderItemDoc[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

const ItemSchema = new Schema<OrderItemDoc>(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    image: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
  },
  { _id: false },
);

const AddressSchema = new Schema<AddressDoc>(
  {
    fullName: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, default: "" },
    pinCode: { type: String, required: true },
    country: { type: String, default: "India" },
    phone: { type: String, required: true },
  },
  { _id: false },
);

// ─── Main schema ─────────────────────────────────────────────────────────────

const OrderSchema = new Schema<OrderDocument>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerId: { type: String },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    shippingAddress: { type: AddressSchema, required: true },
    items: { type: [ItemSchema], required: true },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: { type: String, default: "razorpay" },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    // Razorpay order ID — used for idempotency checks in webhook
    razorpayOrderId: {
      type: String,
      required: true,
      index: true,
    },
    // Set after payment succeeds
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    notes: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model<OrderDocument>("Order", OrderSchema);
