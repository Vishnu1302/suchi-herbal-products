import { Router } from "express";
import crypto from "crypto";
import OrderModel from "../models/order.model";
import { commitInventory, releaseInventory } from "../utils/inventory.utils";

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payments/webhook
//
// ⚠️  IMPORTANT — this route must be registered in index.ts BEFORE
//     `express.json()` so the body arrives as a raw Buffer, which is
//     required for HMAC signature verification.
//
// Security:
//   - Verifies X-Razorpay-Signature using RAZORPAY_WEBHOOK_SECRET
//   - Idempotent: skips orders that are already paid
//
// Handled events:
//   - payment.captured  → mark order paid (most reliable)
//   - order.paid        → fallback confirmation
//   - payment.failed    → mark order failed
// ─────────────────────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"] as string | undefined;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature) {
      return res
        .status(400)
        .json({ message: "Missing X-Razorpay-Signature header" });
    }
    if (!webhookSecret) {
      console.error(
        "RAZORPAY_WEBHOOK_SECRET is not set — cannot verify webhook",
      );
      // Return 200 so Razorpay doesn't endlessly retry while we fix config
      return res
        .status(200)
        .json({ received: true, error: "webhook secret not configured" });
    }

    // ── Verify webhook signature ─────────────────────────────────────────────
    const rawBody = req.body as Buffer;
    const expectedSig = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSig !== signature) {
      console.warn("⚠️  Razorpay webhook signature mismatch");
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    // ── Parse the event ──────────────────────────────────────────────────────
    type RzpPaymentEntity = { id: string; order_id: string; status: string };
    const event = JSON.parse(rawBody.toString()) as {
      event: string;
      payload: {
        payment?: { entity: RzpPaymentEntity };
        order?: { entity: { id: string; status: string } };
      };
    };

    console.log(`📩 Razorpay webhook: ${event.event}`);

    // ── payment.captured ─────────────────────────────────────────────────────
    // This fires when payment is fully captured; most reliable event for "paid"
    if (event.event === "payment.captured") {
      const payment = event.payload.payment?.entity;
      const razorpayOrderId = payment?.order_id;
      const razorpayPaymentId = payment?.id;

      if (razorpayOrderId) {
        const order = await OrderModel.findOne({ razorpayOrderId });
        if (order && order.paymentStatus !== "paid") {
          order.paymentStatus = "paid";
          order.status = "confirmed";
          order.razorpayPaymentId = razorpayPaymentId;
          await order.save();
          // ── Commit inventory ───────────────────────────────────────────────────────
          await commitInventory(order.items);
          console.log(
            `✅ Order ${order.orderNumber} marked PAID via webhook (payment.captured)`,
          );
        } else if (order?.paymentStatus === "paid") {
          console.log(
            `ℹ️  Order ${order.orderNumber} already paid — idempotent skip`,
          );
        }
      }
    }

    // ── order.paid ───────────────────────────────────────────────────────────
    // Alternative event; handles cases where payment was captured without explicit capture call
    if (event.event === "order.paid") {
      const rzpOrderId = event.payload.order?.entity?.id;
      if (rzpOrderId) {
        const order = await OrderModel.findOne({ razorpayOrderId: rzpOrderId });
        if (order && order.paymentStatus !== "paid") {
          order.paymentStatus = "paid";
          order.status = "confirmed";
          await order.save();
          // ── Commit inventory (same as payment.captured path) ────────────
          await commitInventory(order.items);
          console.log(
            `✅ Order ${order.orderNumber} marked PAID via webhook (order.paid)`,
          );
        }
      }
    }

    // ── payment.failed ───────────────────────────────────────────────────────
    if (event.event === "payment.failed") {
      console.log("⚠️  Payment failed event received");
      const razorpayOrderId = event.payload.payment?.entity?.order_id;
      if (razorpayOrderId) {
        const order = await OrderModel.findOne({ razorpayOrderId });
        if (order && order.paymentStatus === "pending") {
          order.paymentStatus = "failed";
          await order.save();
          // ── Release reservation ────────────────────────────────────────
          await releaseInventory(order.items);
          console.log(
            `❌ Order ${order.orderNumber} marked FAILED via webhook`,
          );
        }
      }
    }

    // Always return 200 — Razorpay retries on non-200 responses
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    // Return 200 even on unexpected errors to prevent Razorpay retry flood
    return res.status(200).json({ received: true });
  }
});

export default router;
