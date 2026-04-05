import { inject } from "@angular/core";
import { Router, CanActivateFn } from "@angular/router";
import { toObservable } from "@angular/core/rxjs-interop";
import { firstValueFrom } from "rxjs";
import { filter } from "rxjs/operators";
import { AuthService } from "../services/auth.service";

/**
 * Like authGuard but redirects to /products instead of /auth/login.
 * Used for checkout — unauthenticated users shouldn't be pushed to login,
 * they should just be sent back to the shop.
 */
export const checkoutAuthGuard: CanActivateFn = async (_route, _state) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  if (auth.loading()) {
    await firstValueFrom(
      toObservable(auth.loading).pipe(filter((loading) => !loading)),
    );
  }

  if (auth.currentUser()) {
    return true;
  }

  router.navigate(["/products"]);
  return false;
};
