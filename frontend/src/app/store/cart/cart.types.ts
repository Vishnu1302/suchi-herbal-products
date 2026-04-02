import { Product } from "../../core/models/product.model";

/** Shared cart item shape used across store actions, reducer, and service */
export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}
