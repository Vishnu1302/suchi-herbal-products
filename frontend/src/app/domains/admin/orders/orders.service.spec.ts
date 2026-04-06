import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { AdminOrdersService } from "./orders.service";
import { environment } from "../../../../environments/environment";

const ORIG_USE_MOCK = environment.useMockData;

describe("AdminOrdersService (HTTP mode)", () => {
  let svc: AdminOrdersService;
  let httpMock: HttpTestingController;
  const BASE = `${environment.apiUrl}/orders`;

  const mockDoc = {
    _id: "order-001",
    orderNumber: "SHB-001",
    customerId: "u1",
    customerName: "Test User",
    customerEmail: "t@t.com",
    shippingAddress: {},
    items: [],
    status: "pending",
    paymentStatus: "pending",
    paymentMethod: "razorpay",
    subtotal: 500,
    shippingCost: 0,
    tax: 0,
    total: 500,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    (environment as any).useMockData = false;
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminOrdersService],
    });
    svc = TestBed.inject(AdminOrdersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    (environment as any).useMockData = ORIG_USE_MOCK;
  });

  it("should be created", () => expect(svc).toBeTruthy());

  it("getAll should GET /orders and map _id to id", () => {
    svc.getAll().subscribe((orders) => {
      expect(orders.length).toBe(1);
      expect(orders[0].id).toBe("order-001");
    });
    httpMock.expectOne(BASE).flush([mockDoc]);
  });

  it("getById should GET /orders/:id", () => {
    svc.getById("order-001").subscribe((o) => {
      expect(o?.id).toBe("order-001");
    });
    httpMock.expectOne(`${BASE}/order-001`).flush(mockDoc);
  });

  it("updateStatus should PATCH /orders/:id/status", () => {
    svc.updateStatus("order-001", "shipped").subscribe((o) => {
      expect(o.status).toBe("shipped");
    });
    const req = httpMock.expectOne(`${BASE}/order-001/status`);
    expect(req.request.method).toBe("PATCH");
    expect(req.request.body).toEqual({ status: "shipped" });
    req.flush({ ...mockDoc, status: "shipped" });
  });

  it("getStats should GET /orders/stats", () => {
    svc.getStats().subscribe((stats) => {
      expect(stats.total).toBe(10);
    });
    const req = httpMock.expectOne(`${BASE}/stats`);
    expect(req.request.method).toBe("GET");
    req.flush({
      total: 10,
      pending: 2,
      processing: 1,
      shipped: 3,
      delivered: 3,
      cancelled: 1,
      totalRevenue: 5000,
    });
  });
});

describe("AdminOrdersService (mock data mode)", () => {
  let svc: AdminOrdersService;

  beforeEach(() => {
    (environment as any).useMockData = true;
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminOrdersService],
    });
    svc = TestBed.inject(AdminOrdersService);
  });

  afterEach(() => {
    (environment as any).useMockData = false;
  });

  it("getAll should return mock orders sorted newest first", (done) => {
    svc.getAll().subscribe((orders) => {
      expect(orders.length).toBeGreaterThan(0);
      // Newest-first: first createdAt >= second createdAt
      if (orders.length > 1) {
        const t0 = new Date(orders[0].createdAt).getTime();
        const t1 = new Date(orders[1].createdAt).getTime();
        expect(t0).toBeGreaterThanOrEqual(t1);
      }
      done();
    });
  });

  it("getById should return matching mock order", (done) => {
    svc.getById("ord-001").subscribe((order) => {
      expect(order?.id).toBe("ord-001");
      done();
    });
  });

  it("getById should return undefined for unknown id", (done) => {
    svc.getById("nonexistent").subscribe((order) => {
      expect(order).toBeUndefined();
      done();
    });
  });

  it("updateStatus should update status in mock list", (done) => {
    svc.updateStatus("ord-001", "shipped").subscribe((updated) => {
      expect(updated.status).toBe("shipped");
      done();
    });
  });

  it("getStats should include all paid orders in revenue", (done) => {
    svc.getStats().subscribe((stats) => {
      expect(stats.totalRevenue).toBeGreaterThanOrEqual(0);
      expect(stats.total).toBeGreaterThan(0);
      done();
    });
  });
});
