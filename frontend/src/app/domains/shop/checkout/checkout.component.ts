import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterLink } from "@angular/router";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { firstValueFrom } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { CartService } from "../cart/cart.service";
import { AuthService } from "../../../core/services/auth.service";
import {
  PaymentService,
  type CreateOrderResponse,
} from "../../../core/services/payment.service";
import { AdminProductService } from "../../admin/products/products.service";

/** Extract the most useful message from any thrown value */
function extractError(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    // Angular HTTP error — backend message is in err.error.message
    return err.error?.message ?? err.message ?? "Request failed.";
  }
  if (err instanceof Error) return err.message;
  return "An unexpected error occurred. Please try again.";
}

//  Payment state machine
// idle        form ready to submit
// creating    calling backend POST /api/orders/create
// paying      Razorpay modal is open
// verifying   calling POST /api/orders/:id/verify-payment after success
// dismissed   user closed Razorpay modal without paying  (can reopen)
// failed      payment failed / network error             (can retry fresh)
// resumable   pending order found in localStorage on page load (can resume)
export type PaymentState =
  | "idle"
  | "creating"
  | "paying"
  | "verifying"
  | "dismissed"
  | "failed"
  | "resumable";

// Only opaque identifiers — zero PII.
// Customer info is re-read from AuthService / form on resume.
interface PendingOrder {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  orderNumber: string;
  keyId: string;
}

const PENDING_KEY = "suchi_pending_order";

@Component({
  selector: "app-checkout",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./checkout.component.html",
  styleUrl: "./checkout.component.scss",
})
export class CheckoutComponent implements OnInit {
  //  Injected services
  cartSvc = inject(CartService);
  authSvc = inject(AuthService);
  private readonly paymentSvc = inject(PaymentService);
  private readonly productsSvc = inject(AdminProductService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  //  Reactive state
  state = signal<PaymentState>("idle");
  errorMessage = signal("");
  pendingOrder = signal<PendingOrder | null>(null);
  stockWarnings = signal<string[]>([]);

  //  Delivery form
  form = this.fb.group({
    firstName: ["", Validators.required],
    lastName: [""],
    email: ["", [Validators.required, Validators.email]],
    phone: [
      "",
      [
        Validators.required,
        Validators.pattern(/^[6-9]\d{9}$/), // Indian 10-digit mobile
      ],
    ],
    address: ["", Validators.required],
    city: ["", Validators.required],
    state: ["", Validators.required],
    pin: ["", [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  get f() {
    return this.form.controls;
  }

  //  Lifecycle
  ngOnInit() {
    // Redirect to shop if cart is empty and no pending order to resume
    const raw = localStorage.getItem(PENDING_KEY);
    if (this.cartSvc.cartCount() === 0 && !raw) {
      this.router.navigate(["/products"]);
      return;
    }

    const user = this.authSvc.currentUser();
    if (user) {
      const parts = (user.displayName ?? "").split(" ");
      this.form.patchValue({
        firstName: parts[0] ?? "",
        lastName: parts.slice(1).join(" ") ?? "",
        email: user.email ?? "",
      });
    }
    this.checkPendingPayment();
  }

  //
  // PENDING PAYMENT RECOVERY
  // If the browser closed / refreshed during payment, localStorage holds
  // the order info. We fetch the backend status:
  //   paid     clear + redirect to order-success
  //   failed   clear + let user retry
  //   pending  offer resume
  //
  private async checkPendingPayment() {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return;
    try {
      const pending: PendingOrder = JSON.parse(raw);
      const uid = this.authSvc.currentUser()?.uid;
      const order = await firstValueFrom(
        this.paymentSvc.getOrder(pending.orderId, uid),
      );
      const status = order["paymentStatus"];

      if (status === "paid") {
        localStorage.removeItem(PENDING_KEY);
        this.cartSvc.clearCart();
        this.router.navigate(["/order-success", pending.orderId]);
        return;
      }
      if (status === "failed") {
        localStorage.removeItem(PENDING_KEY);
        this.errorMessage.set(
          "Your previous payment failed. Please try again.",
        );
        return;
      }
      // Pending  offer resume
      this.pendingOrder.set(pending);
      this.state.set("resumable");
    } catch {
      localStorage.removeItem(PENDING_KEY);
    }
  }

  //
  // PLACE ORDER
  //
  async placeOrder() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.authSvc.isLoggedIn && !this.authSvc.isEmailVerified) return;
    if (this.cartSvc.cartItems().length === 0) {
      this.errorMessage.set("Your cart is empty.");
      return;
    }

    // ── Live stock check (LTT) ─────────────────────────────────────────────
    // Fetch current product state from DB for every cart item and warn if
    // any are out-of-stock. We still allow the order (pre-order behaviour).
    this.stockWarnings.set([]);
    try {
      const warnings: string[] = [];
      for (const item of this.cartSvc.cartItems()) {
        const latest = await firstValueFrom(
          this.productsSvc.getById(item.product.id),
        );
        if (latest && (!latest.inStock || latest.stockCount <= 0)) {
          warnings.push(`"${latest.name}" is currently out of stock.`);
        }
      }
      this.stockWarnings.set(warnings);
      // If there are warnings, the UI shows them but we do NOT block the order.
    } catch {
      // Non-fatal — proceed even if check fails
    }
    // ──────────────────────────────────────────────────────────────────────

    this.errorMessage.set("");
    this.state.set("creating");

    const v = this.form.value;
    const user = this.authSvc.currentUser();

    const payload = {
      items: this.cartSvc.cartItems().map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
        selectedSize: i.selectedSize,
        selectedColor: i.selectedColor,
      })),
      customer: {
        name: `${v.firstName ?? ""} ${v.lastName ?? ""}`.trim(),
        email: v.email ?? "",
        phone: v.phone ?? "",
        address: v.address ?? "",
        city: v.city ?? "",
        state: v.state ?? "",
        pin: v.pin ?? "",
        uid: user?.uid,
      },
    };

    let orderData: CreateOrderResponse;
    try {
      orderData = await firstValueFrom(this.paymentSvc.createOrder(payload));
    } catch (err) {
      this.errorMessage.set(extractError(err));
      this.state.set("failed");
      return;
    }

    // Save to localStorage BEFORE opening Razorpay  protects against browser close.
    // SECURITY: only opaque identifiers stored — no PII (name/address/phone).
    const pending: PendingOrder = {
      orderId: orderData.orderId,
      razorpayOrderId: orderData.razorpayOrderId,
      amount: orderData.amount,
      currency: orderData.currency,
      orderNumber: orderData.orderNumber,
      keyId: orderData.keyId,
    };
    localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
    this.pendingOrder.set(pending);

    await this.openPaymentModal(orderData);
  }

  //
  // RESUME PAYMENT
  //
  async resumePayment() {
    const pending = this.pendingOrder();
    if (!pending) return;
    this.errorMessage.set("");
    await this.openPaymentModal(pending);
  }

  //
  // START FRESH  discard stale pending order
  //
  startFresh() {
    localStorage.removeItem(PENDING_KEY);
    this.pendingOrder.set(null);
    this.state.set("idle");
    this.errorMessage.set("");
  }

  //
  // OPEN PAYMENT MODAL (shared by placeOrder + resumePayment)
  //
  private async openPaymentModal(
    order: Pick<
      PendingOrder,
      | "orderId"
      | "razorpayOrderId"
      | "amount"
      | "currency"
      | "orderNumber"
      | "keyId"
    >,
  ) {
    try {
      await this.paymentSvc.loadScript();
    } catch (err) {
      this.errorMessage.set(extractError(err));
      this.state.set("failed");
      return;
    }

    this.state.set("paying");

    // Prefill from Firebase user + form — never read from localStorage.
    const fbUser = this.authSvc.currentUser();
    const prefillName = fbUser?.displayName ?? this.form.value.firstName ?? "";
    const prefillEmail = fbUser?.email ?? this.form.value.email ?? "";
    const prefillPhone = this.form.value.phone ?? "";

    try {
      const response = await this.paymentSvc.openRazorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Veda",
        description: `Order #${order.orderNumber}`,
        order_id: order.razorpayOrderId,
        prefill: {
          name: prefillName,
          email: prefillEmail,
          contact: prefillPhone,
        },
        theme: { color: "#7412bf" },
        modal: { ondismiss: () => this.state.set("dismissed") },
      });

      //  Verify payment locally on backend
      this.state.set("verifying");
      const result = await firstValueFrom(
        this.paymentSvc.verifyPayment(order.orderId, {
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
        }),
      );

      if (result.success) {
        localStorage.removeItem(PENDING_KEY);
        this.cartSvc.clearCart();
        this.router.navigate(["/order-success", order.orderId]);
      } else {
        this.errorMessage.set(
          `Payment received but could not be verified. Contact support with order #${order.orderNumber}.`,
        );
        this.state.set("failed");
      }
    } catch (err) {
      const msg = extractError(err);
      if (msg === "dismissed") {
        this.state.set("dismissed");
      } else {
        this.errorMessage.set(msg);
        this.state.set("failed");
      }
    }
  }
}
