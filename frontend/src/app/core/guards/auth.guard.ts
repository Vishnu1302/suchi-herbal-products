import { inject } from "@angular/core";
import { Router, CanActivateFn } from "@angular/router";
import { toObservable } from "@angular/core/rxjs-interop";
import { firstValueFrom } from "rxjs";
import { filter } from "rxjs/operators";
import { AuthService } from "../services/auth.service";

export const authGuard: CanActivateFn = async (_route, _state) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  // Wait for Firebase auth state to resolve before checking
  if (auth.loading()) {
    await firstValueFrom(
      toObservable(auth.loading).pipe(filter((loading) => !loading)),
    );
  }

  if (auth.currentUser()) {
    return true;
  }

  router.navigate(["/auth/login"]);
  return false;
};
