import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { AdminProductService } from "./products.service";
import { environment } from "../../../../environments/environment";
import { Product } from "../../../core/models/product.model";

// Pin mock data flag to false so we always test real HTTP paths
const ORIG_USE_MOCK = environment.useMockData;

describe("AdminProductService (HTTP mode)", () => {
  let svc: AdminProductService;
  let httpMock: HttpTestingController;
  const BASE = `${environment.apiUrl}/products`;

  const mockDoc = {
    _id: "abc123",
    name: "Brahmi Oil",
    slug: "brahmi-oil",
    description: "desc",
    ingredients: "ing",
    usage: "use",
    price: 249,
    images: [],
    category: "oil",
    inStock: true,
    stockCount: 50,
  };

  beforeEach(() => {
    (environment as any).useMockData = false;
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminProductService],
    });
    svc = TestBed.inject(AdminProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    (environment as any).useMockData = ORIG_USE_MOCK;
  });

  it("should be created", () => expect(svc).toBeTruthy());

  it("getAll should GET /products and map _id to id", () => {
    svc.getAll().subscribe((products) => {
      expect(products.length).toBe(1);
      expect(products[0].id).toBe("abc123");
      expect((products[0] as any)._id).toBeUndefined();
    });
    httpMock.expectOne(BASE).flush([mockDoc]);
  });

  it("getAll with search filter should filter client-side", () => {
    svc.getAll({ search: "brahmi" }).subscribe((products) => {
      expect(products.length).toBe(1);
    });
    httpMock.expectOne(BASE).flush([mockDoc]);
  });

  it("getAll with non-matching search should return empty", () => {
    svc.getAll({ search: "xyz" }).subscribe((products) => {
      expect(products.length).toBe(0);
    });
    httpMock.expectOne(BASE).flush([mockDoc]);
  });

  it("getById should GET /products/:id", () => {
    svc.getById("abc123").subscribe((p) => {
      expect(p?.id).toBe("abc123");
    });
    httpMock.expectOne(`${BASE}/abc123`).flush(mockDoc);
  });

  it("create should POST to /products", () => {
    const payload: Omit<Product, "id"> = {
      name: "New",
      slug: "new",
      description: "",
      ingredients: "",
      usage: "",
      price: 100,
      images: [],
      category: "soap",
      inStock: true,
      stockCount: 10,
    };
    svc.create(payload).subscribe((p) => {
      expect(p.id).toBe("abc123");
    });
    const req = httpMock.expectOne(BASE);
    expect(req.request.method).toBe("POST");
    req.flush(mockDoc);
  });

  it("update should PUT to /products/:id", () => {
    svc.update("abc123", { price: 300 }).subscribe((p) => {
      expect(p.id).toBe("abc123");
    });
    const req = httpMock.expectOne(`${BASE}/abc123`);
    expect(req.request.method).toBe("PUT");
    req.flush({ ...mockDoc, price: 300 });
  });

  it("delete should DELETE /products/:id", () => {
    svc.delete("abc123").subscribe();
    const req = httpMock.expectOne(`${BASE}/abc123`);
    expect(req.request.method).toBe("DELETE");
    req.flush(null);
  });
});

describe("AdminProductService (mock data mode)", () => {
  let svc: AdminProductService;

  beforeEach(() => {
    (environment as any).useMockData = true;
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminProductService],
    });
    svc = TestBed.inject(AdminProductService);
  });

  afterEach(() => {
    (environment as any).useMockData = false;
  });

  it("getAll should return mock products", (done) => {
    svc.getAll().subscribe((products) => {
      expect(products.length).toBeGreaterThan(0);
      done();
    });
  });

  it("getStats should compute counts from mock data", () => {
    const stats = svc.getStats();
    expect(stats.total).toBeGreaterThan(0);
    expect(stats.inStock + stats.outOfStock).toBeLessThanOrEqual(stats.total);
  });
});
