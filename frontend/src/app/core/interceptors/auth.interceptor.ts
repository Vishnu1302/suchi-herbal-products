import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
} from "@angular/common/http";
import { inject } from "@angular/core";
import { from, switchMap } from "rxjs";
import { AuthService } from "../services/auth.service";
import { environment } from "../../../environments/environment";

/**
 * Attaches a Firebase ID token as `Authorization: Bearer <token>` on every
 * request that goes to our own backend API, but only when the user is logged in.
 *
 * Anonymous users (guest checkout) hit /api/orders/create without a token —
 * the backend accepts that route without auth.
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const auth = inject(AuthService);
  const user = auth.currentUser();

  // Only attach token for requests to our own backend
  if (!req.url.startsWith(environment.apiUrl) || !user) {
    return next(req);
  }

  return from(user.getIdToken()).pipe(
    switchMap((token) => {
      const cloned = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
      return next(cloned);
    }),
  );
};
