/**
 * CartService — thin facade over the NgRx cart store.
 *
 * All existing consumers (CartComponent, CheckoutComponent, Navbar, etc.)
 * continue to call the same API. Internally every mutation dispatches a
 * NgRx action, and every selector is bridged to an Angular Signal via
 * toSignal() so templates can still use the `()` call syntax.
 */
import { Injectable, inject, Signal } from "@angular/core";
import { Store } from "@ngrx/store";
import { toSignal } from "@angular/core/rxjs-interop";
import { Product } from "../../../core/models/product.model";
import { CartActions } from "../../../store/cart/cart.actions";
import {
  selectCartItems,
  selectCartCount,
  selectCartTotal,
} from "../../../store/cart/cart.selectors";
import type { CartItem } from "../../../store/cart/cart.types";
import type { AppState } from "../../../store/app.state";

// Re-export CartItem so existing imports from './cart.service' keep working
export type { CartItem } from "../../../store/cart/cart.types";

@Injectable({ providedIn: "root" })
export class CartService {
  private readonly store = inject<Store<AppState>>(Store);

  /** Signal – reactive list of all cart items */
  readonly cartItems: Signal<CartItem[]> = toSignal(
    this.store.select(selectCartItems),
    {
      initialValue: [] as CartItem[],
    },
  );

  /** Signal – total item count */
  readonly cartCount: Signal<number> = toSignal(
    this.store.select(selectCartCount),
    {
      initialValue: 0,
    },
  );

  /** Signal – grand total in ₹ */
  readonly cartTotal: Signal<number> = toSignal(
    this.store.select(selectCartTotal),
    {
      initialValue: 0,
    },
  );

  addToCart(product: Product, size: string, color: string, qty = 1): void {
    this.store.dispatch(CartActions.addToCart({ product, size, color, qty }));
  }

  removeFromCart(productId: string, size: string, color: string): void {
    this.store.dispatch(CartActions.removeFromCart({ productId, size, color }));
  }

  updateQuantity(
    productId: string,
    size: string,
    color: string,
    qty: number,
  ): void {
    this.store.dispatch(
      CartActions.updateQuantity({ productId, size, color, qty }),
    );
  }

  clearCart(): void {
    this.store.dispatch(CartActions.clearCart());
  }
}
