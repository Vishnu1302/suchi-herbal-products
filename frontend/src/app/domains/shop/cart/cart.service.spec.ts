import { TestBed } from "@angular/core/testing";
import { provideMockStore, MockStore } from "@ngrx/store/testing";
import { CartService } from "./cart.service";
import { CartActions } from "../../../store/cart/cart.actions";
import {
  selectCartItems,
  selectCartCount,
  selectCartTotal,
} from "../../../store/cart/cart.selectors";
import { Product } from "../../../core/models/product.model";
import { AppState } from "../../../store/app.state";

const mockProduct = (id: string): Product => ({
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
  stockCount: 20,
});

describe("CartService", () => {
  let svc: CartService;
  let store: MockStore<AppState>;

  const initialState = { cart: { items: [] } };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CartService, provideMockStore({ initialState })],
    });
    svc = TestBed.inject(CartService);
    store = TestBed.inject(MockStore);
    spyOn(store, "dispatch").and.callThrough();
  });

  afterEach(() => {
    store.resetSelectors();
  });

  it("should be created", () => {
    expect(svc).toBeTruthy();
  });

  it("addToCart should dispatch addToCart action", () => {
    const p = mockProduct("p1");
    svc.addToCart(p, "S", "Red", 2);
    expect(store.dispatch).toHaveBeenCalledWith(
      CartActions.addToCart({ product: p, size: "S", color: "Red", qty: 2 }),
    );
  });

  it("removeFromCart should dispatch removeFromCart action", () => {
    svc.removeFromCart("p1", "S", "Red");
    expect(store.dispatch).toHaveBeenCalledWith(
      CartActions.removeFromCart({ productId: "p1", size: "S", color: "Red" }),
    );
  });

  it("updateQuantity should dispatch updateQuantity action", () => {
    svc.updateQuantity("p1", "S", "Red", 5);
    expect(store.dispatch).toHaveBeenCalledWith(
      CartActions.updateQuantity({
        productId: "p1",
        size: "S",
        color: "Red",
        qty: 5,
      }),
    );
  });

  it("clearCart should dispatch clearCart action", () => {
    svc.clearCart();
    expect(store.dispatch).toHaveBeenCalledWith(CartActions.clearCart());
  });

  it("cartItems signal should reflect store state", () => {
    store.overrideSelector(selectCartItems, [
      {
        product: mockProduct("p1"),
        quantity: 3,
        selectedSize: "",
        selectedColor: "",
      },
    ]);
    store.refreshState();
    expect(svc.cartItems().length).toBe(1);
  });

  it("cartCount signal should reflect store count", () => {
    store.overrideSelector(selectCartCount, 7);
    store.refreshState();
    expect(svc.cartCount()).toBe(7);
  });

  it("cartTotal signal should reflect store total", () => {
    store.overrideSelector(selectCartTotal, 1400);
    store.refreshState();
    expect(svc.cartTotal()).toBe(1400);
  });
});
