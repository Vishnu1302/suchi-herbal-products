import { createReducer, on } from "@ngrx/store";
import { CartItem } from "./cart.types";
export type { CartItem } from "./cart.types";
import { CartActions } from "./cart.actions";

export interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

export const cartReducer = createReducer(
  initialState,

  on(CartActions.addToCart, (state, { product, size, color, qty }) => {
    const existing = state.items.find(
      (i) =>
        i.product.id === product.id &&
        i.selectedSize === size &&
        i.selectedColor === color,
    );
    if (existing) {
      return {
        ...state,
        items: state.items.map((i) =>
          i === existing ? { ...i, quantity: i.quantity + qty } : i,
        ),
      };
    }
    return {
      ...state,
      items: [
        ...state.items,
        { product, quantity: qty, selectedSize: size, selectedColor: color },
      ],
    };
  }),

  on(CartActions.removeFromCart, (state, { productId, size, color }) => ({
    ...state,
    items: state.items.filter(
      (i) =>
        !(
          i.product.id === productId &&
          i.selectedSize === size &&
          i.selectedColor === color
        ),
    ),
  })),

  on(CartActions.updateQuantity, (state, { productId, size, color, qty }) => {
    if (qty <= 0) {
      return {
        ...state,
        items: state.items.filter(
          (i) =>
            !(
              i.product.id === productId &&
              i.selectedSize === size &&
              i.selectedColor === color
            ),
        ),
      };
    }
    return {
      ...state,
      items: state.items.map((i) =>
        i.product.id === productId &&
        i.selectedSize === size &&
        i.selectedColor === color
          ? { ...i, quantity: qty }
          : i,
      ),
    };
  }),

  on(CartActions.clearCart, (state) => ({ ...state, items: [] })),

  on(CartActions.loadCartSuccess, (_state, { items }) => ({ items })),
);
