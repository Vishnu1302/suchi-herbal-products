import { inject } from "@angular/core";
import { Router, CanActivateFn } from "@angular/router";
import { toObservable } from "@angular/core/rxjs-interop";
import { firstValueFrom } from "rxjs";
import { filter } from "rxjs/operators";
import { AuthService } from "../services/auth.service";

export const adminGuard: CanActivateFn = async (_route, _state) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  // Wait for Firebase auth state to finish resolving before checking
  if (auth.loading()) {
    await firstValueFrom(
      toObservable(auth.loading).pipe(filter((loading) => !loading)),
    );
  }

  const user = auth.currentUser();
  if (!user) {
    router.navigate(["/auth/login"]);
    return false;
  }

  // Use the frontend ADMIN_EMAILS list for navigation gating.
  // Real per-endpoint enforcement happens on the backend via Bearer token.
  // We avoid a live backend fetch here so a sleeping Render instance doesn't
  // block navigation.
  if (!auth.isAdmin) {
    router.navigate(["/"]);
    return false;
  }

  return true;
};
