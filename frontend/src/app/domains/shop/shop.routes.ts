import { Routes } from "@angular/router";
import { authGuard } from "../../core/guards/auth.guard";
import { cartGuard } from "../../core/guards/cart.guard";

export const SHOP_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./shop-shell/shop-shell.component").then(
        (m) => m.ShopShellComponent,
      ),
    children: [
      {
        path: "",
        loadComponent: () =>
          import("./home/home.component").then((m) => m.HomeComponent),
        title: "Home | Aurea",
      },
      {
        path: "products",
        loadComponent: () =>
          import("./product-catalog/product-catalog.component").then(
            (m) => m.ProductCatalogComponent,
          ),
        title: "Shop | Aurea",
      },
      {
        path: "products/:id",
        loadComponent: () =>
          import("./product-detail/product-detail.component").then(
            (m) => m.ProductDetailComponent,
          ),
        title: "Product | Aurea",
      },
      {
        path: "cart",
        loadComponent: () =>
          import("./cart/cart.component").then((m) => m.CartComponent),
        title: "Cart | Aurea",
      },
      {
        path: "checkout",
        canActivate: [authGuard, cartGuard],
        loadComponent: () =>
          import("./checkout/checkout.component").then(
            (m) => m.CheckoutComponent,
          ),
        title: "Checkout | Aurea",
      },
      {
        path: "order-success/:orderId",
        canActivate: [authGuard],
        loadComponent: () =>
          import("./order-success/order-success.component").then(
            (m) => m.OrderSuccessComponent,
          ),
        title: "Order Placed! | Aurea",
      },
      {
        path: "terms",
        loadComponent: () =>
          import("../../shared/legal/terms.component").then(
            (m) => m.TermsComponent,
          ),
        title: "Terms & Conditions | Aurea",
      },
      {
        path: "privacy",
        loadComponent: () =>
          import("../../shared/legal/privacy.component").then(
            (m) => m.PrivacyComponent,
          ),
        title: "Privacy Policy | Aurea",
      },
    ],
  },
];
