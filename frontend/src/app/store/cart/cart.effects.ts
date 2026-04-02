import { Injectable, inject } from "@angular/core";
import {
  Actions,
  createEffect,
  ofType,
  ROOT_EFFECTS_INIT,
} from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { map, tap, withLatestFrom } from "rxjs/operators";
import { CartActions } from "./cart.actions";
import { selectCartItems } from "./cart.selectors";
import { CartItem } from "./cart.types";

const STORAGE_KEY = "suchi_cart";

@Injectable()
export class CartEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);

  /** Hydrate cart from localStorage when the app boots */
  loadOnInit$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROOT_EFFECTS_INIT),
      map(() => {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          const items: CartItem[] = raw ? (JSON.parse(raw) as CartItem[]) : [];
          return CartActions.loadCartSuccess({ items });
        } catch {
          return CartActions.loadCartSuccess({ items: [] });
        }
      }),
    ),
  );

  /** Persist cart to localStorage on every mutation */
  persist$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          CartActions.addToCart,
          CartActions.removeFromCart,
          CartActions.updateQuantity,
          CartActions.clearCart,
        ),
        withLatestFrom(this.store.select(selectCartItems)),
        tap(([, items]) => {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        }),
      ),
    { dispatch: false },
  );
}
