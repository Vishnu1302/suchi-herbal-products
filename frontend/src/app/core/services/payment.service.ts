import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

// ─── Razorpay global type declaration ────────────────────────────────────────
// Razorpay JS SDK is loaded dynamically from checkout.razorpay.com/v1/checkout.js
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: { color?: string };
  modal?: {
    ondismiss?: () => void;
    backdropclose?: boolean;
    escape?: boolean;
  };
  // handler is intentionally optional here — PaymentService overrides it
  // internally to bridge into Promises
  handler?: (response: RazorpaySuccessResponse) => void;
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayInstance {
  open(): void;
  on(
    event: "payment.failed",
    handler: (res: { error: { description: string } }) => void,
  ): void;
}

// ─── API contract types ───────────────────────────────────────────────────────

export interface CartItemPayload {
  productId: string;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface CustomerPayload {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  uid?: string;
}

export interface CreateOrderPayload {
  items: CartItemPayload[];
  customer: CustomerPayload;
}

export interface CreateOrderResponse {
  orderId: string;
  orderNumber: string;
  razorpayOrderId: string;
  amount: number; // in paise
  currency: string;
  keyId: string;
}

export interface VerifyPaymentPayload {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  orderId: string;
  alreadyProcessed?: boolean;
}

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable({ providedIn: "root" })
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;
  private scriptLoaded = false;

  /**
   * Dynamically loads Razorpay checkout.js only when it's actually needed
   * (i.e., when the user reaches the checkout page).
   * Safe to call multiple times — resolves immediately if already loaded.
   */
  loadScript(): Promise<void> {
    if (
      this.scriptLoaded ||
      (globalThis as unknown as Window).Razorpay !== undefined
    ) {
      this.scriptLoaded = true;
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };
      script.onerror = () =>
        reject(
          new Error(
            "Failed to load Razorpay SDK. Check your internet connection.",
          ),
        );
      document.body.appendChild(script);
    });
  }

  /** Step 1 — POST to backend; prices are re-verified from DB */
  createOrder(payload: CreateOrderPayload): Observable<CreateOrderResponse> {
    return this.http.post<CreateOrderResponse>(
      `${this.api}/orders/create`,
      payload,
    );
  }

  /**
   * Step 3 — Verify payment signature on backend immediately after
   * Razorpay success callback fires. This is a fast-path confirmation.
   * The webhook is still the authoritative source but this gives instant UX.
   */
  verifyPayment(
    orderId: string,
    payload: VerifyPaymentPayload,
  ): Observable<VerifyPaymentResponse> {
    return this.http.post<VerifyPaymentResponse>(
      `${this.api}/orders/${orderId}/verify-payment`,
      payload,
    );
  }

  /**
   * Fetch order by MongoDB id — used by order-success and pending-check.
   * Pass the Firebase UID so the backend can verify ownership.
   * Admin calls that don't send a UID are still permitted (no header sent).
   */
  getOrder(orderId: string, uid?: string): Observable<Record<string, unknown>> {
    const headers: Record<string, string> = {};
    if (uid) headers["X-Customer-UID"] = uid;
    return this.http.get<Record<string, unknown>>(
      `${this.api}/orders/${orderId}`,
      { headers },
    );
  }

  /**
   * Step 2 — Open the Razorpay checkout modal.
   *
   * Returns a Promise that:
   *   resolves → payment success (with payment IDs for signature verification)
   *   rejects  → Error('dismissed') if user closes the modal
   *   rejects  → Error(description) if Razorpay reports a payment failure
   */
  openRazorpay(options: RazorpayOptions): Promise<RazorpaySuccessResponse> {
    return new Promise((resolve, reject) => {
      const rzpOptions: RazorpayOptions = {
        ...options,
        // Override handler — resolve the Promise with payment IDs
        handler: (response: RazorpaySuccessResponse) => resolve(response),
        modal: {
          ...options.modal,
          backdropclose: false, // prevent accidental dismiss on backdrop click
          escape: false, // prevent ESC closing the modal
          ondismiss: () => {
            options.modal?.ondismiss?.();
            reject(new Error("dismissed"));
          },
        },
      };

      const rzp = new (globalThis as unknown as Window).Razorpay(rzpOptions);

      rzp.on("payment.failed", (response) => {
        reject(
          new Error(
            response.error?.description ?? "Payment failed. Please try again.",
          ),
        );
      });

      rzp.open();
    });
  }
}
