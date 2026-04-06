import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { signal } from "@angular/core";
import { of } from "rxjs";
import { ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { ProductCatalogComponent } from "./product-catalog.component";
import { AdminProductService } from "../../admin/products/products.service";
import { CartService } from "../cart/cart.service";
import { MOCK_PRODUCTS } from "../../../core/mocks/products.mock";

describe("ProductCatalogComponent", () => {
  let component: ProductCatalogComponent;
  let fixture: ComponentFixture<ProductCatalogComponent>;
  let productSvcSpy: jasmine.SpyObj<AdminProductService>;
  let cartSvcSpy: jasmine.SpyObj<CartService>;

  const mockActivatedRoute = {
    snapshot: { queryParamMap: { get: () => null } },
  };

  beforeEach(async () => {
    productSvcSpy = jasmine.createSpyObj("AdminProductService", ["getAll"]);
    productSvcSpy.getAll.and.returnValue(of([...MOCK_PRODUCTS]));

    cartSvcSpy = jasmine.createSpyObj("CartService", [
      "addToCart",
      "removeFromCart",
      "updateQuantity",
    ]);
    (cartSvcSpy as any).cartItems = signal([]);

    await TestBed.configureTestingModule({
      imports: [
        ProductCatalogComponent,
        RouterTestingModule,
        ReactiveFormsModule,
      ],
      providers: [
        { provide: AdminProductService, useValue: productSvcSpy },
        { provide: CartService, useValue: cartSvcSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => expect(component).toBeTruthy());

  it("should load all products initially", () => {
    expect(component.filteredProducts.length).toBe(MOCK_PRODUCTS.length);
  });

  it("resetFilter should restore default form values", () => {
    component.filterForm.patchValue({ category: "oil", sortBy: "price-asc" });
    component.resetFilter();
    expect(component.filterForm.value.category).toBe("");
    expect(component.filterForm.value.sortBy).toBe("newest");
  });

  it("getCategoryLabel should return display name for known slug", () => {
    expect(component.getCategoryLabel("oil")).toBe("Oil");
  });

  it("getCategoryLabel should return slug for unknown category", () => {
    expect(component.getCategoryLabel("unknown")).toBe("unknown");
  });

  it("getSortLabel should return correct label for price-asc", () => {
    expect(component.getSortLabel("price-asc")).toBe("Price ↑");
  });

  it("getCartQty should return 0 when product not in cart", () => {
    expect(component.getCartQty("prod-999")).toBe(0);
  });

  it("getRemainingStock should equal stockCount when cart is empty", () => {
    const p = MOCK_PRODUCTS[0];
    expect(component.getRemainingStock(p)).toBe(p.stockCount);
  });

  it("addToCart should call cartSvc.addToCart for in-stock product", () => {
    const p = MOCK_PRODUCTS.find((pr) => pr.inStock && pr.stockCount > 0)!;
    component.addToCart(p);
    expect(cartSvcSpy.addToCart).toHaveBeenCalledWith(p, "", "", 1);
  });

  it("addToCart should NOT call cartSvc.addToCart for out-of-stock product", () => {
    const p = { ...MOCK_PRODUCTS[0], inStock: false, stockCount: 0 };
    component.addToCart(p);
    expect(cartSvcSpy.addToCart).not.toHaveBeenCalled();
  });

  it("addToCart should show toast message", () => {
    const p = MOCK_PRODUCTS.find((pr) => pr.inStock && pr.stockCount > 0)!;
    component.addToCart(p);
    expect(component.toastMessage()).toContain(p.name);
  });
});
