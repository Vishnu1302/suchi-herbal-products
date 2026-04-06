import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { CartComponent } from "./cart.component";
import { CartService, CartItem } from "./cart.service";
import { signal } from "@angular/core";
import { Product } from "../../../core/models/product.model";

const mockProduct = (id: string, stock = 10): Product => ({
  id,
  name: `Product ${id}`,
  slug: `product-${id}`,
  description: "",
  ingredients: "",
  usage: "",
  price: 200,
  images: [],
  category: "oil",
  inStock: true,
  stockCount: stock,
});

const makeItem = (productId: string, qty = 1, stock = 10): CartItem => ({
  product: mockProduct(productId, stock),
  quantity: qty,
  selectedSize: "",
  selectedColor: "",
});

describe("CartComponent", () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;
  let cartSvcSpy: jasmine.SpyObj<CartService>;

  beforeEach(async () => {
    cartSvcSpy = jasmine.createSpyObj("CartService", [
      "updateQuantity",
      "removeFromCart",
    ]);
    (cartSvcSpy as any).cartItems = signal<CartItem[]>([]);
    (cartSvcSpy as any).cartCount = signal(0);
    (cartSvcSpy as any).cartTotal = signal(0);

    await TestBed.configureTestingModule({
      imports: [CartComponent, RouterTestingModule],
      providers: [{ provide: CartService, useValue: cartSvcSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => expect(component).toBeTruthy());

  it("cartItems getter should return cartSvc.cartItems()", () => {
    (cartSvcSpy as any).cartItems = signal([makeItem("p1", 2)]);
    fixture.detectChanges();
    expect(component.cartItems.length).toBe(1);
  });

  it("maxQty should return product stockCount", () => {
    const item = makeItem("p1", 1, 5);
    expect(component.maxQty(item)).toBe(5);
  });

  it("atStockLimit should be true when qty === stockCount", () => {
    const item = makeItem("p1", 5, 5);
    expect(component.atStockLimit(item)).toBeTrue();
  });

  it("atStockLimit should be false when qty < stockCount", () => {
    const item = makeItem("p1", 3, 5);
    expect(component.atStockLimit(item)).toBeFalse();
  });

  it("increment should call updateQuantity with qty+1", () => {
    const item = makeItem("p1", 2, 10);
    component.increment(item);
    expect(cartSvcSpy.updateQuantity).toHaveBeenCalledWith("p1", "", "", 3);
  });

  it("increment should NOT call updateQuantity when at stock limit", () => {
    const item = makeItem("p1", 5, 5);
    component.increment(item);
    expect(cartSvcSpy.updateQuantity).not.toHaveBeenCalled();
  });

  it("decrement should call updateQuantity with qty-1", () => {
    const item = makeItem("p1", 3, 10);
    component.decrement(item);
    expect(cartSvcSpy.updateQuantity).toHaveBeenCalledWith("p1", "", "", 2);
  });

  it("remove should call removeFromCart with product id", () => {
    const item = makeItem("p1", 1);
    component.remove(item);
    expect(cartSvcSpy.removeFromCart).toHaveBeenCalledWith("p1", "", "");
  });
});
