import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { cartGuard } from "./cart.guard";

const CART_KEY = "aurea_cart";
const PENDING_KEY = "aurea_pending_order";

describe("cartGuard", () => {
  let routerSpy: jasmine.SpyObj<Router>;

  function runGuard() {
    return TestBed.runInInjectionContext(() => cartGuard({} as any, {} as any));
  }

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj("Router", ["navigate"]);
    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: routerSpy }],
    });
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should redirect to /products when cart is empty and no pending order", () => {
    const result = runGuard();
    expect(result as boolean).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/products"]);
  });

  it("should allow access when cart has items", () => {
    localStorage.setItem(
      CART_KEY,
      JSON.stringify([{ product: { id: "p1" }, quantity: 1 }]),
    );
    const result = runGuard();
    expect(result as boolean).toBeTrue();
  });

  it("should allow access when there is a valid non-expired pending order", () => {
    const pending = { orderId: "o1", savedAt: Date.now() };
    localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
    const result = runGuard();
    expect(result as boolean).toBeTrue();
  });

  it("should redirect and remove expired pending order", () => {
    const TEN_MINUTES_AGO = Date.now() - 11 * 60 * 1000;
    const pending = { orderId: "o1", savedAt: TEN_MINUTES_AGO };
    localStorage.setItem(PENDING_KEY, JSON.stringify(pending));

    const result = runGuard();
    expect(result as boolean).toBeFalse();
    expect(localStorage.getItem(PENDING_KEY)).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/products"]);
  });

  it("should redirect when cart is malformed JSON", () => {
    localStorage.setItem(CART_KEY, "not json {{");
    const result = runGuard();
    expect(result as boolean).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/products"]);
  });

  it("should redirect when cart is an empty array", () => {
    localStorage.setItem(CART_KEY, JSON.stringify([]));
    const result = runGuard();
    expect(result as boolean).toBeFalse();
  });
});
