import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { AdminInventoryService } from "./inventory.service";
import { environment } from "../../../../environments/environment";

const ORIG_USE_MOCK = environment.useMockData;

describe("AdminInventoryService (HTTP mode)", () => {
  let svc: AdminInventoryService;
  let httpMock: HttpTestingController;
  const BASE = `${environment.apiUrl}/inventory`;

  const mockItem = {
    productId: "p1",
    productName: "Brahmi Oil",
    sku: "OIL-001",
    image: "",
    category: "oil",
    stock: 50,
    lowStockThreshold: 10,
    status: "in-stock",
    lastUpdated: new Date(),
  };

  beforeEach(() => {
    (environment as any).useMockData = false;
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminInventoryService],
    });
    svc = TestBed.inject(AdminInventoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    (environment as any).useMockData = ORIG_USE_MOCK;
  });

  it("should be created", () => expect(svc).toBeTruthy());

  it("getAll should GET /inventory", () => {
    svc.getAll().subscribe((items) => {
      expect(items.length).toBe(1);
      expect(items[0].productId).toBe("p1");
    });
    httpMock.expectOne(BASE).flush([mockItem]);
  });

  it("getByProductId should GET /inventory/:productId", () => {
    svc.getByProductId("p1").subscribe((item) => {
      expect(item?.productId).toBe("p1");
    });
    httpMock.expectOne(`${BASE}/p1`).flush(mockItem);
  });

  it("updateStock should POST to /inventory/update-stock", () => {
    const payload = { productId: "p1", newStock: 30, reason: "restock" };
    svc.updateStock(payload).subscribe((item) => {
      expect(item.stock).toBe(30);
    });
    const req = httpMock.expectOne(`${BASE}/update-stock`);
    expect(req.request.method).toBe("POST");
    req.flush({ ...mockItem, stock: 30 });
  });
});

describe("AdminInventoryService (mock data mode)", () => {
  let svc: AdminInventoryService;

  beforeEach(() => {
    (environment as any).useMockData = true;
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminInventoryService],
    });
    svc = TestBed.inject(AdminInventoryService);
  });

  afterEach(() => {
    (environment as any).useMockData = false;
  });

  it("getAll should return mock inventory items", (done) => {
    svc.getAll().subscribe((items) => {
      expect(items.length).toBeGreaterThan(0);
      done();
    });
  });

  it("updateStock should update the item in the mock list", (done) => {
    svc
      .updateStock({ productId: "prod-001", newStock: 0, reason: "sold out" })
      .subscribe((updated) => {
        expect(updated.stock).toBe(0);
        expect(updated.status).toBe("out-of-stock");
        done();
      });
  });

  it("updateStock should set low-stock status when below threshold", (done) => {
    svc
      .updateStock({ productId: "prod-001", newStock: 5, reason: "sold" })
      .subscribe((updated) => {
        // prod-001 has lowStockThreshold=15, newStock=5 → low-stock
        expect(updated.status).toBe("low-stock");
        done();
      });
  });

  it("getStats should return counts per status", () => {
    (environment as any).useMockData = true;
    const stats = svc.getStats();
    expect(stats.total).toBeGreaterThan(0);
    expect(stats.inStock + stats.lowStock + stats.outOfStock).toBe(stats.total);
  });
});
