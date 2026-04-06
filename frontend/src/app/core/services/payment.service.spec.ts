import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { PaymentService } from "./payment.service";
import { environment } from "../../../environments/environment";

describe("PaymentService", () => {
  let svc: PaymentService;
  let httpMock: HttpTestingController;
  const API = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PaymentService],
    });
    svc = TestBed.inject(PaymentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ─── createOrder ─────────────────────────────────────────────────────────

  it("should POST to /orders/create and return CreateOrderResponse", () => {
    const payload = {
      items: [
        { productId: "p1", quantity: 1, selectedSize: "", selectedColor: "" },
      ],
      customer: {
        name: "Test",
        email: "t@t.com",
        phone: "9876543210",
        address: "Addr",
        city: "City",
        state: "State",
        pin: "400001",
      },
    };
    const mockResp = {
      orderId: "o1",
      orderNumber: "SHB-001",
      razorpayOrderId: "rzp_o1",
      amount: 10000,
      currency: "INR",
      keyId: "rzp_test_key",
    };

    svc.createOrder(payload as any).subscribe((res) => {
      expect(res.orderId).toBe("o1");
      expect(res.amount).toBe(10000);
    });

    const req = httpMock.expectOne(`${API}/orders/create`);
    expect(req.request.method).toBe("POST");
    req.flush(mockResp);
  });

  // ─── verifyPayment ────────────────────────────────────────────────────────

  it("should POST to /orders/:id/verify-payment", () => {
    const verifyPayload = {
      razorpayPaymentId: "pay_1",
      razorpayOrderId: "rzp_o1",
      razorpaySignature: "sig",
    };

    svc.verifyPayment("o1", verifyPayload).subscribe((res) => {
      expect(res.success).toBeTrue();
    });

    const req = httpMock.expectOne(`${API}/orders/o1/verify-payment`);
    expect(req.request.method).toBe("POST");
    req.flush({ success: true, orderId: "o1" });
  });

  // ─── getOrder ─────────────────────────────────────────────────────────────

  it("should GET /orders/:id without UID header when no uid passed", () => {
    svc.getOrder("o1").subscribe();
    const req = httpMock.expectOne(`${API}/orders/o1`);
    expect(req.request.method).toBe("GET");
    expect(req.request.headers.has("X-Customer-UID")).toBeFalse();
    req.flush({});
  });

  it("should attach X-Customer-UID header when uid is provided", () => {
    svc.getOrder("o1", "uid-abc").subscribe();
    const req = httpMock.expectOne(`${API}/orders/o1`);
    expect(req.request.headers.get("X-Customer-UID")).toBe("uid-abc");
    req.flush({});
  });

  // ─── loadScript ───────────────────────────────────────────────────────────

  it("should resolve immediately if Razorpay is already on window", async () => {
    (window as any).Razorpay = class {};
    await expectAsync(svc.loadScript()).toBeResolved();
    // clean up
    delete (window as any).Razorpay;
  });

  it("should append a script tag when Razorpay is not loaded", () => {
    delete (window as any).Razorpay;
    // The script gets appended but we won't simulate onload here — just check it doesn't throw
    const promise = svc.loadScript();
    const scripts = document.querySelectorAll('script[src*="razorpay"]');
    expect(scripts.length).toBeGreaterThan(0);
    // Clean up pending promise (no resolve needed for this test)
    scripts.forEach((s) => s.remove());
  });
});
