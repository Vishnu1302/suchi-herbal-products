import { inject } from "@angular/core";
import { Router, CanActivateFn } from "@angular/router";
import { toObservable } from "@angular/core/rxjs-interop";
import { firstValueFrom } from "rxjs";
import { filter } from "rxjs/operators";
import { AuthService } from "../services/auth.service";
import { environment } from "../../../environments/environment";

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
    // Not logged in at all → go to login
    router.navigate(["/auth/login"]);
    return false;
  }

  const email = user.email ?? "";
  if (environment.adminEmails.includes(email)) {
    return true;
  }

  // Logged in but not an admin → redirect home
  router.navigate(["/"]);
  return false;
};
