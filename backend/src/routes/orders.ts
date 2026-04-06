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
    // Cap the number of distinct line items to limit the inventory-locking
    // blast radius from unauthenticated abuse of this public endpoint.
    const MAX_LINE_ITEMS = 20;
    if (items.length > MAX_LINE_ITEMS) {
      return res.status(400).json({
        message: `Order cannot contain more than ${MAX_LINE_ITEMS} distinct items`,
      });
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
      // Out-of-stock products are blocked at the reservation step below.
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

    // ── Availability pre-check — reject before touching Razorpay or MongoDB ────
    const failedIds = await reserveInventory(orderItems);
    if (failedIds.length > 0) {
      const failedNames = orderItems
        .filter((i) => failedIds.includes(i.productId))
        .map((i) => i.productName)
        .join(", ");
      return res
        .status(409)
        .json({ message: `Insufficient stock for: ${failedNames}` });
    }

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

    // ── Inventory already reserved above ─────────────────────────────────

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

    const callerUid = req.headers["x-customer-uid"] as string | undefined;
    const hasAuthToken =
      req.headers.authorization?.startsWith("Bearer ") ?? false;
    const isGuestOrder = !order.customerId || order.customerId === "guest";

    // ── PII protection ───────────────────────────────────────────────────────
    // For user-owned (non-guest) orders, require proof of identity:
    //   - x-customer-uid  → sent by shop pages (order-success, checkout resume)
    //   - Authorization: Bearer  → sent by admin panel via auth interceptor
    // This blocks anonymous scraping of order details (name, email, address).
    if (!isGuestOrder && !callerUid && !hasAuthToken) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // ── Ownership guard ──────────────────────────────────────────────────────
    // When a customer UID is provided, it MUST match the order's customerId.
    // Admin requests use Bearer token (no x-customer-uid) so this is skipped.
    if (callerUid && !isGuestOrder && order.customerId !== callerUid) {
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

    // ── Cross-check: body razorpayOrderId must match what is stored on the order ─
    // Prevents a replayed signature from a different payment being applied here.
    if (order.razorpayOrderId !== razorpayOrderId) {
      console.warn(`⚠️  razorpayOrderId mismatch for order ${req.params.id}`);
      return res
        .status(400)
        .json({ message: "Payment does not match this order" });
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

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders/cleanup-stale
//
// Releases inventory reservations for orders that are still "pending" after
// STALE_AFTER_MS (20 min). Razorpay orders expire at 15 min so any order
// still pending at 20 min was never paid and never will be.
//
// Protects against the inventory-locking attack vector on the open
// /api/orders/create endpoint.
//
// Can be called:
//   - Manually by an admin via the admin panel
//   - By a scheduled cron/cloud-scheduler hitting this endpoint with an admin token
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/cleanup-stale",
  requireAdmin,
  async (_req: Request, res: Response) => {
    const STALE_AFTER_MS = 20 * 60 * 1000; // 20 minutes
    const cutoff = new Date(Date.now() - STALE_AFTER_MS);

    try {
      const staleOrders = await OrderModel.find({
        paymentStatus: "pending",
        createdAt: { $lt: cutoff },
      });

      if (staleOrders.length === 0) {
        return res.json({ released: 0, message: "No stale orders found" });
      }

      // Release inventory reservations in parallel, then mark as failed
      await Promise.all(staleOrders.map((o) => releaseInventory(o.items)));
      await OrderModel.updateMany(
        { _id: { $in: staleOrders.map((o) => o._id) } },
        { $set: { paymentStatus: "failed", status: "cancelled" } },
      );

      console.log(
        `🧹 Cleanup: released reservations for ${staleOrders.length} stale orders`,
      );
      return res.json({
        released: staleOrders.length,
        orderNumbers: staleOrders.map((o) => o.orderNumber),
      });
    } catch (err) {
      console.error("Error cleaning up stale orders:", err);
      return res.status(500).json({ message: "Cleanup failed" });
    }
  },
);

export default router;
