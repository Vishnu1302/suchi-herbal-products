import {
  selectCartItems,
  selectCartCount,
  selectCartTotal,
  selectCartQtyForSize,
} from "./cart.selectors";
import { CartState } from "./cart.reducer";
import { CartItem } from "./cart.types";
import { Product } from "../../core/models/product.model";

const makeProduct = (id: string, price = 100): Product => ({
  id,
  name: `Product ${id}`,
  slug: `product-${id}`,
  description: "",
  ingredients: "",
  usage: "",
  price,
  images: [],
  category: "oil",
  inStock: true,
  stockCount: 50,
});

const makeItem = (
  productId: string,
  qty = 1,
  size = "",
  color = "",
  price = 100,
): CartItem => ({
  product: makeProduct(productId, price),
  quantity: qty,
  selectedSize: size,
  selectedColor: color,
});

describe("Cart Selectors", () => {
  const emptyState = { cart: { items: [] as CartItem[] } };

  const populatedState = {
    cart: {
      items: [
        makeItem("p1", 2, "S", "", 200), // 2 × 200 = 400
        makeItem("p2", 1, "M", "", 300), // 1 × 300 = 300
      ],
    },
  };

  // ─── selectCartItems ──────────────────────────────────────────────────────

  it("selectCartItems should return empty array for no items", () => {
    expect(selectCartItems(emptyState as any)).toEqual([]);
  });

  it("selectCartItems should return all cart items", () => {
    expect(selectCartItems(populatedState as any).length).toBe(2);
  });

  // ─── selectCartCount ──────────────────────────────────────────────────────

  it("selectCartCount should be 0 with no items", () => {
    expect(selectCartCount(emptyState as any)).toBe(0);
  });

  it("selectCartCount should sum all quantities", () => {
    // 2 + 1 = 3
    expect(selectCartCount(populatedState as any)).toBe(3);
  });

  // ─── selectCartTotal ──────────────────────────────────────────────────────

  it("selectCartTotal should be 0 with no items", () => {
    expect(selectCartTotal(emptyState as any)).toBe(0);
  });

  it("selectCartTotal should compute sum of price×qty", () => {
    // 2×200 + 1×300 = 700
    expect(selectCartTotal(populatedState as any)).toBe(700);
  });

  // ─── selectCartQtyForSize ─────────────────────────────────────────────────

  it("selectCartQtyForSize should return qty for matching product+size", () => {
    const selector = selectCartQtyForSize("p1", "S");
    expect(selector(populatedState as any)).toBe(2);
  });

  it("selectCartQtyForSize should return 0 when product not in cart", () => {
    const selector = selectCartQtyForSize("p99", "S");
    expect(selector(populatedState as any)).toBe(0);
  });

  it("selectCartQtyForSize should return 0 when size does not match", () => {
    const selector = selectCartQtyForSize("p1", "XL");
    expect(selector(populatedState as any)).toBe(0);
  });
});
