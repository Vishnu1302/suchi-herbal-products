import { createActionGroup, emptyProps, props } from "@ngrx/store";
import { Product } from "../../core/models/product.model";
import { CartItem } from "./cart.types";

export const CartActions = createActionGroup({
  source: "Cart",
  events: {
    /** Add a product+size+color to cart (merges if already present) */
    "Add To Cart": props<{
      product: Product;
      size: string;
      color: string;
      qty: number;
    }>(),
    /** Remove a specific product+size+color entry */
    "Remove From Cart": props<{
      productId: string;
      size: string;
      color: string;
    }>(),
    /** Set absolute quantity (0 = remove) */
    "Update Quantity": props<{
      productId: string;
      size: string;
      color: string;
      qty: number;
    }>(),
    /** Empty the entire cart */
    "Clear Cart": emptyProps(),
    /** Fired by effect on app init to hydrate cart from localStorage */
    "Load Cart Success": props<{ items: CartItem[] }>(),
  },
});
