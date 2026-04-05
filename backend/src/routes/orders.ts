import { Router, type Request, type Response } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import ProductModel from "../models/product.model";
import OrderModel, { type OrderStatus } from "../models/order.model";
import { requireAdmin } from "../middleware/adminAuth";
import {
  reserveInventory,
  commitInventory,
  releaseInventory,
  restockInventory,
} from "../utils/inventory.utils";
import { sendOrderConfirmationEmail } from "../utils/email.utils";

const router = Router();

// ─── Razorpay client (lazy so missing keys don't crash the import) ───────────
function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error(
      "RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env",
    );
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

function generateOrderNumber(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rnd = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `SKF-${ymd}-${rnd}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders/create
//
// Flow:
//   1. Re-fetch product prices from DB (never trust frontend amounts)
//   2. Create a Razorpay order (amount in paise)
//   3. Save a pending Order document in MongoDB
//   4. Return { orderId, razorpayOrderId, amount, keyId } to the frontend
// ─────────────────────────────────────────────────────────────────────────────
router.post("/create", async (req: Request, res: Response) => {
  try {
    const { items, customer } = req.body as {
      items: {
        productId: string;
        quantity: number;
      }[];
      customer: {
        name: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        state?: string;
        pin: string;
        uid?: string;
      };
    };

    // ── Basic input validation ───────────────────────────────────────────────
    if (!items?.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    if (
      !customer?.name ||
      !customer?.email ||
      !customer?.phone ||
      !customer?.address ||
      !customer?.city ||
      !customer?.pin
    ) {
      return res
        .status(400)
        .json({ message: "Customer details are incomplete" });
    }

    // ── Re-fetch product prices from DB ──────────────────────────────────────
    const productIds = [...new Set(items.map((i) => i.productId))];
    const products = await ProductModel.find({
      _id: { $in: productIds },
    }).lean();
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = productMap.get(item.productId);

      if (!product) {
        return res
          .status(400)
          .json({ message: `Product ${item.productId} not found` });
      }
      // Note: out-of-stock products are intentionally allowed (pre-order behaviour).
      // The frontend performs a live stock check (LTT) before checkout and warns the user.
      if (
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 100
      ) {
        return res
          .status(400)
          .json({ message: `Invalid quantity for "${product.name}"` });
      }

      const totalPrice = product.price * item.quantity;
      subtotal += totalPrice;

      orderItems.push({
        productId: item.productId,
        productName: product.name,
        image: product.images?.[0] ?? "",
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice,
      });
    }

    const shippingCost = 0; // free shipping
    const tax = 0;
    const total = subtotal + shippingCost + tax;
    const amountPaise = Math.round(total * 100); // Razorpay expects paise

    // ── Create Razorpay order ────────────────────────────────────────────────
    const razorpay = getRazorpay();
    const orderNumber = generateOrderNumber();

    const rzpOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: orderNumber, // For your reconciliation
    });

    // ── Persist pending order in MongoDB ─────────────────────────────────────
    const order = await OrderModel.create({
      orderNumber,
      customerId: customer.uid ?? "guest",
      customerName: customer.name,
      customerEmail: customer.email,
      shippingAddress: {
        fullName: customer.name,
        line1: customer.address,
        city: customer.city,
        state: customer.state ?? "",
        pinCode: customer.pin,
        country: "India",
        phone: customer.phone,
      },
      items: orderItems,
      paymentMethod: "razorpay",
      subtotal,
      shippingCost,
      tax,
      total,
      razorpayOrderId: rzpOrder.id,
    });

    // ── Reserve inventory for each item ──────────────────────────────────────
    await reserveInventory(orderItems);

    return res.status(201).json({
      orderId: String(order._id),
      orderNumber: order.orderNumber,
      razorpayOrderId: rzpOrder.id,
      amount: amountPaise,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID!,
    });
  } catch (err) {
    console.error("Error creating order:", err);
    return res
      .status(500)
      .json({ message: "Failed to create order. Please try again." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders
// Admin: list all orders, newest first
// ─────────────────────────────────────────────────────────────────────────────
router.get("/", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const orders = await OrderModel.find().sort({ createdAt: -1 }).lean();
    return res.json(orders);
  } catch (err) {
    console.error("Error listing orders:", err);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/stats
// Admin dashboard summary — MUST be defined before /:id to avoid match clash
// ─────────────────────────────────────────────────────────────────────────────
router.get("/stats", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const [total, pending, processing, shipped, delivered, cancelled, revenue] =
      await Promise.all([
        OrderModel.countDocuments(),
        OrderModel.countDocuments({ status: "pending" }),
        OrderModel.countDocuments({ status: "processing" }),
        OrderModel.countDocuments({ status: "shipped" }),
        OrderModel.countDocuments({ status: "delivered" }),
        OrderModel.countDocuments({ status: "cancelled" }),
        OrderModel.aggregate([
          { $match: { paymentStatus: "paid" } },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ]),
      ]);
    return res.json({
      total,
      pending,
      processing,
      shipped,
      delivered,
      cancelled,
      totalRevenue: (revenue[0]?.total as number) ?? 0,
    });
  } catch (err) {
    console.error("Error fetching order stats:", err);
    return res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/orders/:id/status
// Admin: update order fulfilment status
// ─────────────────────────────────────────────────────────────────────────────
router.patch(
  "/:id/status",
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { status } = req.body as { status: string };
      const allowed = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ];
      if (!allowed.includes(status)) {
        return res.status(400).json({ message: `Invalid status: ${status}` });
      }

      // Fetch first so we can read the previous status for inventory decisions
      const order = await OrderModel.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const prevStatus = order.status;
      order.status = status as OrderStatus;
      await order.save();

      // ── Inventory adjustment on cancellation ──────────────────────────────────
      if (status === "cancelled" && prevStatus !== "cancelled") {
        if (order.paymentStatus === "pending") {
          // Payment never received — release the reservation so stock is available again
          await releaseInventory(order.items);
        } else if (order.paymentStatus === "paid") {
          // Payment was made and stock was already committed at payment time.
          // Restore stock + available (reserved was already cleared at commit).
          await restockInventory(order.items);
        }
      }

      return res.json(order.toObject());
    } catch (err) {
      console.error("Error updating order status:", err);
      return res.status(500).json({ message: "Failed to update status" });
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/:id
//
// Returns the current order status.
// Used by:
//   - Frontend to check a pending order on page refresh / resume
//   - order-success page to display order details
// ─────────────────────────────────────────────────────────────────────────────
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const order = await OrderModel.findById(req.params.id).lean();
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ── Ownership guard ──────────────────────────────────────────────────────
    // If the caller sends their Firebase UID, verify it against the stored
    // customerId on the order.  Admin requests don't send this header, so they
    // are unaffected.  This prevents Order-ID-swap attacks via DevTools.
    const callerUid = req.headers["x-customer-uid"] as string | undefined;
    if (callerUid && order.customerId && order.customerId !== callerUid) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.json(order);
  } catch (err) {
    console.error("Error fetching order:", err);
    return res.status(500).json({ message: "Failed to fetch order" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders/:id/verify-payment
//
// Called by the Angular app immediately after Razorpay checkout succeeds.
// This is the "fast path" — webhook is still the authoritative source but this
// gives instant UI feedback.
//
// Verifies Razorpay HMAC signature:
//   HMAC-SHA256(razorpayOrderId + "|" + razorpayPaymentId, KEY_SECRET)
//
// Idempotent — safe to call multiple times for the same orderId.
// ─────────────────────────────────────────────────────────────────────────────
router.post("/:id/verify-payment", async (req: Request, res: Response) => {
  try {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature } =
      req.body as {
        razorpayPaymentId: string;
        razorpayOrderId: string;
        razorpaySignature: string;
      };

    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return res
        .status(400)
        .json({ message: "Missing payment verification fields" });
    }

    // ── Cryptographic signature check ────────────────────────────────────────
    const expectedSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSig !== razorpaySignature) {
      console.warn(`⚠️  Payment signature mismatch for order ${req.params.id}`);
      return res
        .status(400)
        .json({ message: "Payment signature verification failed" });
    }

    const order = await OrderModel.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ── Idempotency — webhook may already have marked as paid ────────────────
    if (order.paymentStatus === "paid") {
      return res.json({
        success: true,
        orderId: String(order._id),
        alreadyProcessed: true,
      });
    }

    // ── Mark order as paid & confirmed ───────────────────────────────────────
    order.paymentStatus = "paid";
    order.status = "confirmed";
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    await order.save();

    // ── Commit inventory: permanently deduct stock, clear reservation ─────────
    await commitInventory(order.items);

    // ── Send order confirmation email (non-fatal) ─────────────────────────────
    sendOrderConfirmationEmail({
      to: order.customerEmail,
      customerName: order.customerName,
      orderNumber: order.orderNumber,
      items: order.items.map((i) => ({
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice,
      })),
      total: order.total,
      shippingAddress: {
        line1: order.shippingAddress.line1,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        pinCode: order.shippingAddress.pinCode,
      },
    }).catch((err: unknown) =>
      console.error("Failed to send confirmation email:", err),
    );

    console.log(`✅ Order ${order.orderNumber} PAID — verified via frontend`);
    return res.json({ success: true, orderId: String(order._id) });
  } catch (err) {
    console.error("Error verifying payment:", err);
    return res.status(500).json({ message: "Failed to verify payment" });
  }
});

export default router;
