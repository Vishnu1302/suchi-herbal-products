import { Routes } from "@angular/router";

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
        title: "Home | Veda",
      },
      {
        path: "products",
        loadComponent: () =>
          import("./product-catalog/product-catalog.component").then(
            (m) => m.ProductCatalogComponent,
          ),
        title: "Shop | Veda",
      },
      {
        path: "products/:id",
        loadComponent: () =>
          import("./product-detail/product-detail.component").then(
            (m) => m.ProductDetailComponent,
          ),
        title: "Product | Veda",
      },
      {
        path: "cart",
        loadComponent: () =>
          import("./cart/cart.component").then((m) => m.CartComponent),
        title: "Cart | Veda",
      },
      {
        path: "checkout",
        loadComponent: () =>
          import("./checkout/checkout.component").then(
            (m) => m.CheckoutComponent,
          ),
        title: "Checkout | Veda",
      },
      {
        path: "order-success/:orderId",
        loadComponent: () =>
          import("./order-success/order-success.component").then(
            (m) => m.OrderSuccessComponent,
          ),
        title: "Order Placed! | Veda",
      },
      {
        path: "terms",
        loadComponent: () =>
          import("../../shared/legal/terms.component").then(
            (m) => m.TermsComponent,
          ),
        title: "Terms & Conditions | Veda",
      },
      {
        path: "privacy",
        loadComponent: () =>
          import("../../shared/legal/privacy.component").then(
            (m) => m.PrivacyComponent,
          ),
        title: "Privacy Policy | Veda",
      },
    ],
  },
];
