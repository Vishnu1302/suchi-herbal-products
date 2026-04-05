import { inject } from "@angular/core";
import { Router, CanActivateFn } from "@angular/router";

const CART_KEY = "aurea_cart";
const PENDING_KEY = "aurea_pending_order";
const PENDING_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Protects the checkout route.
 * Allows access when:
 *   - Cart has at least one item, OR
 *   - There is an unexpired pending payment (savedAt within last 10 minutes)
 * Redirects to /products otherwise.
 */
export const cartGuard: CanActivateFn = (_route, _state) => {
  const router = inject(Router);

  try {
    const rawCart = localStorage.getItem(CART_KEY);
    const cartItems = rawCart ? (JSON.parse(rawCart) as unknown[]) : [];
    if (Array.isArray(cartItems) && cartItems.length > 0) {
      return true;
    }

    // Check for an unexpired pending payment
    const rawPending = localStorage.getItem(PENDING_KEY);
    if (rawPending) {
      const pending = JSON.parse(rawPending) as { savedAt?: number };
      const savedAt = pending.savedAt ?? 0;
      if (Date.now() - savedAt < PENDING_EXPIRY_MS) {
        return true;
      }
      // Expired — clean it up
      localStorage.removeItem(PENDING_KEY);
    }
  } catch {
    // Malformed localStorage — fall through to redirect
  }

  router.navigate(["/products"]);
  return false;
};
