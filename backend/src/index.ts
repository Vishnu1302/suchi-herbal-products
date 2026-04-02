import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import productsRouter from "./routes/products";
import inventoryRouter from "./routes/inventory";
import uploadsRouter from "./routes/uploads";
import ordersRouter from "./routes/orders";
import paymentWebhookRouter from "./routes/payment-webhook";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || "";

app.use(cors());

// ⚠️  WEBHOOK MUST BE REGISTERED WITH RAW BODY PARSER BEFORE express.json()
// Razorpay signature verification requires the exact raw bytes of the request body.
// If express.json() parses the body first the Buffer is gone and verification fails.
app.use("/api/payments/webhook", express.raw({ type: "*/*" }));
app.use("/api/payments/webhook", paymentWebhookRouter);

// Global JSON parser for all other routes
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/products", productsRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/orders", ordersRouter);

async function start() {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not set in environment");
    }

    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Backend listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
