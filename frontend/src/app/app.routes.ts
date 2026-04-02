import { Routes } from "@angular/router";
import { adminGuard } from "./core/guards/admin.guard";

export const routes: Routes = [
  // ── Auth Domain ───────────────────────────────────────────────────────────
  {
    path: "auth",
    loadChildren: () =>
      import("./domains/auth/auth.routes").then((m) => m.AUTH_ROUTES),
  },

  // ── Shop Domain (public) ─────────────────────────────────────────────────
  {
    path: "",
    loadChildren: () =>
      import("./domains/shop/shop.routes").then((m) => m.SHOP_ROUTES),
  },

  // ── Admin Domain (protected) ─────────────────────────────────────────────
  {
    path: "admin",
    canActivate: [adminGuard],
    loadChildren: () =>
      import("./domains/admin/admin.routes").then((m) => m.ADMIN_ROUTES),
  },

  // ── Fallback ─────────────────────────────────────────────────────────────
  {
    path: "**",
    loadComponent: () =>
      import("./shared/not-found/not-found.component").then(
        (m) => m.NotFoundComponent,
      ),
    title: "404 | Veda",
  },
];
