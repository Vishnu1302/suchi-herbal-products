import { cartReducer, CartState } from "./cart.reducer";
import { CartActions } from "./cart.actions";
import { CartItem } from "./cart.types";
import { Product } from "../../core/models/product.model";

const mockProduct = (id: string, stock = 50): Product => ({
  id,
  name: `Product ${id}`,
  slug: `product-${id}`,
  description: "",
  ingredients: "",
  usage: "",
  price: 100,
  images: [],
  category: "oil",
  inStock: true,
  stockCount: stock,
});

const makeItem = (
  productId: string,
  qty = 1,
  size = "",
  color = "",
): CartItem => ({
  product: mockProduct(productId),
  quantity: qty,
  selectedSize: size,
  selectedColor: color,
});

describe("cartReducer", () => {
  const initialState: CartState = { items: [] };

  // ─── addToCart ────────────────────────────────────────────────────────────

  it("should add a new item to an empty cart", () => {
    const action = CartActions.addToCart({
      product: mockProduct("p1"),
      size: "",
      color: "",
      qty: 1,
    });
    const state = cartReducer(initialState, action);
    expect(state.items.length).toBe(1);
    expect(state.items[0].product.id).toBe("p1");
    expect(state.items[0].quantity).toBe(1);
  });

  it("should merge quantity when same product+size+color already in cart", () => {
    const startState: CartState = { items: [makeItem("p1", 2)] };
    const action = CartActions.addToCart({
      product: mockProduct("p1"),
      size: "",
      color: "",
      qty: 3,
    });
    const state = cartReducer(startState, action);
    expect(state.items.length).toBe(1);
    expect(state.items[0].quantity).toBe(5);
  });

  it("should add a separate entry for different size of same product", () => {
    const startState: CartState = {
      items: [makeItem("p1", 1, "S", "")],
    };
    const action = CartActions.addToCart({
      product: mockProduct("p1"),
      size: "M",
      color: "",
      qty: 1,
    });
    const state = cartReducer(startState, action);
    expect(state.items.length).toBe(2);
  });

  // ─── removeFromCart ───────────────────────────────────────────────────────

  it("should remove item by productId+size+color", () => {
    const startState: CartState = {
      items: [makeItem("p1", 2), makeItem("p2", 1)],
    };
    const action = CartActions.removeFromCart({
      productId: "p1",
      size: "",
      color: "",
    });
    const state = cartReducer(startState, action);
    expect(state.items.length).toBe(1);
    expect(state.items[0].product.id).toBe("p2");
  });

  it("should not remove items that do not match size", () => {
    const startState: CartState = {
      items: [makeItem("p1", 1, "S"), makeItem("p1", 1, "M")],
    };
    const action = CartActions.removeFromCart({
      productId: "p1",
      size: "S",
      color: "",
    });
    const state = cartReducer(startState, action);
    expect(state.items.length).toBe(1);
    expect(state.items[0].selectedSize).toBe("M");
  });

  // ─── updateQuantity ───────────────────────────────────────────────────────

  it("should update the quantity of a matching item", () => {
    const startState: CartState = { items: [makeItem("p1", 2)] };
    const action = CartActions.updateQuantity({
      productId: "p1",
      size: "",
      color: "",
      qty: 5,
    });
    const state = cartReducer(startState, action);
    expect(state.items[0].quantity).toBe(5);
  });

  it("should remove the item when updated quantity is 0", () => {
    const startState: CartState = { items: [makeItem("p1", 2)] };
    const action = CartActions.updateQuantity({
      productId: "p1",
      size: "",
      color: "",
      qty: 0,
    });
    const state = cartReducer(startState, action);
    expect(state.items.length).toBe(0);
  });

  it("should remove the item when updated quantity is negative", () => {
    const startState: CartState = { items: [makeItem("p1", 1)] };
    const action = CartActions.updateQuantity({
      productId: "p1",
      size: "",
      color: "",
      qty: -1,
    });
    const state = cartReducer(startState, action);
    expect(state.items.length).toBe(0);
  });

  // ─── clearCart ────────────────────────────────────────────────────────────

  it("should empty all items on clearCart", () => {
    const startState: CartState = {
      items: [makeItem("p1"), makeItem("p2")],
    };
    const state = cartReducer(startState, CartActions.clearCart());
    expect(state.items.length).toBe(0);
  });

  // ─── loadCartSuccess ──────────────────────────────────────────────────────

  it("should hydrate state from loadCartSuccess", () => {
    const items = [makeItem("p1", 3)];
    const action = CartActions.loadCartSuccess({ items });
    const state = cartReducer(initialState, action);
    expect(state.items.length).toBe(1);
    expect(state.items[0].quantity).toBe(3);
  });

  // ─── immutability ─────────────────────────────────────────────────────────

  it("should not mutate the previous state", () => {
    const frozen = { items: [] } as CartState;
    Object.freeze(frozen);
    expect(() =>
      cartReducer(
        frozen,
        CartActions.addToCart({
          product: mockProduct("p1"),
          size: "",
          color: "",
          qty: 1,
        }),
      ),
    ).not.toThrow();
  });
});
