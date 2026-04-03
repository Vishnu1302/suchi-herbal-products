import express, { type Request, type Response } from "express";
import cors, { type CorsOptions } from "cors";
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

const allowedOrigins = new Set(
  (process.env.CLIENT_URL || "http://localhost:4200")
    .split(",")
    .map((s: string) => s.trim()),
);

const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    // Allow server-to-server calls (no origin) and whitelisted origins
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// ⚠️  WEBHOOK MUST BE REGISTERED WITH RAW BODY PARSER BEFORE express.json()
// Razorpay signature verification requires the exact raw bytes of the request body.
// If express.json() parses the body first the Buffer is gone and verification fails.
app.use("/api/payments/webhook", express.raw({ type: "*/*" }));
app.use("/api/payments/webhook", paymentWebhookRouter);

// Global JSON parser for all other routes
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/api/products", productsRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/orders", ordersRouter);

// Start HTTP server immediately so Render health checks pass
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});

// Connect to MongoDB after server is up — failures log but don't crash the process
if (!MONGODB_URI) {
  console.error("WARNING: MONGODB_URI is not set — database calls will fail");
} else {
  mongoose.set("bufferTimeoutMS", 30000);
  mongoose
    .connect(MONGODB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err: unknown) => console.error("MongoDB connection error:", err));
}
