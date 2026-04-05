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

  // Ask the backend to verify the token and confirm admin status.
  // The backend checks the email against ADMIN_EMAILS env var — not the frontend bundle.
  const idToken = await user.getIdToken();
  const apiUrl = (await import("../../../environments/environment")).environment
    .apiUrl;

  try {
    const res = await fetch(`${apiUrl}/orders/stats`, {
      headers: { Authorization: `Bearer ${idToken}` },
    });
    if (res.ok) return true;
  } catch {
    // network error — deny access
  }

  router.navigate(["/"]);
  return false;
};
