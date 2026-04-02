import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./admin-shell/admin-shell.component').then(
        (m) => m.AdminShellComponent
      ),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
        title: 'Dashboard | Suchi Admin',
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./products/product-list/product-list.component').then(
            (m) => m.ProductListComponent
          ),
        title: 'Products | Suchi Admin',
      },
      {
        path: 'products/new',
        loadComponent: () =>
          import('./products/product-form/product-form.component').then(
            (m) => m.ProductFormComponent
          ),
        title: 'Add Product | Suchi Admin',
      },
      {
        path: 'products/:id/edit',
        loadComponent: () =>
          import('./products/product-form/product-form.component').then(
            (m) => m.ProductFormComponent
          ),
        title: 'Edit Product | Suchi Admin',
      },
      {
        path: 'inventory',
        loadComponent: () =>
          import('./inventory/inventory-list/inventory-list.component').then(
            (m) => m.InventoryListComponent
          ),
        title: 'Inventory | Suchi Admin',
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./orders/order-list/order-list.component').then(
            (m) => m.OrderListComponent
          ),
        title: 'Orders | Suchi Admin',
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./orders/order-detail/order-detail.component').then(
            (m) => m.OrderDetailComponent
          ),
        title: 'Order Detail | Suchi Admin',
      },
    ],
  },
];
