import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { AdminProductService } from "../products/products.service";
import { AdminOrdersService } from "../orders/orders.service";
import { AdminInventoryService } from "../inventory/inventory.service";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, RouterLink],
  styleUrl: "./dashboard.component.scss",
  template: `
    <div class="dashboard">
      <div class="page-header">
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      <!-- Status Summary Row -->
      <div class="summary-row">
        <!-- Orders by status -->
        <div class="summary-card">
          <h3 class="summary-card__title">📋 Orders by Status</h3>
          <div class="status-list">
            <div class="status-item">
              <span class="dot dot--yellow"></span>
              <span>Pending</span>
              <strong>{{ orderStats.pending }}</strong>
            </div>
            <div class="status-item">
              <span class="dot dot--blue"></span>
              <span>Processing</span>
              <strong>{{ orderStats.processing }}</strong>
            </div>
            <div class="status-item">
              <span class="dot dot--purple"></span>
              <span>Shipped</span>
              <strong>{{ orderStats.shipped }}</strong>
            </div>
            <div class="status-item">
              <span class="dot dot--green"></span>
              <span>Delivered</span>
              <strong>{{ orderStats.delivered }}</strong>
            </div>
            <div class="status-item">
              <span class="dot dot--red"></span>
              <span>Cancelled</span>
              <strong>{{ orderStats.cancelled }}</strong>
            </div>
          </div>
          <a routerLink="/admin/orders" class="summary-card__link"
            >View all orders →</a
          >
        </div>

        <!-- Inventory alerts -->
        <div class="summary-card">
          <h3 class="summary-card__title">📦 Inventory Status</h3>
          <div class="status-list">
            <div class="status-item">
              <span class="dot dot--green"></span>
              <span>In Stock</span>
              <strong>{{ inventoryStats.inStock }}</strong>
            </div>
            <div class="status-item">
              <span class="dot dot--yellow"></span>
              <span>Low Stock</span>
              <strong>{{ inventoryStats.lowStock }}</strong>
            </div>
            <div class="status-item">
              <span class="dot dot--red"></span>
              <span>Out of Stock</span>
              <strong>{{ inventoryStats.outOfStock }}</strong>
            </div>
          </div>
          <a routerLink="/admin/inventory" class="summary-card__link"
            >Manage inventory →</a
          >
        </div>

        <!-- Products -->
        <div class="summary-card">
          <h3 class="summary-card__title">👕 Product Catalogue</h3>
          <div class="status-list">
            <div class="status-item">
              <span class="dot dot--green"></span>
              <span>In Stock</span>
              <strong>{{ productStats.inStock }}</strong>
            </div>
            <div class="status-item">
              <span class="dot dot--red"></span>
              <span>Out of Stock</span>
              <strong>{{ productStats.outOfStock }}</strong>
            </div>
            <div class="status-item">
              <span class="dot dot--yellow"></span>
              <span>Low Stock</span>
              <strong>{{ productStats.lowStock }}</strong>
            </div>
          </div>
          <a routerLink="/admin/products" class="summary-card__link"
            >Manage products →</a
          >
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h3 class="quick-actions__title">⚡ Quick Actions</h3>
        <div class="quick-actions__list">
          <a routerLink="/admin/products/new" class="qa-btn">
            <span>➕</span> Add New Product
          </a>
          <a routerLink="/admin/inventory" class="qa-btn">
            <span>📦</span> Update Stock
          </a>
          <a routerLink="/admin/orders" class="qa-btn">
            <span>🔍</span> Review Orders
          </a>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private readonly productSvc = inject(AdminProductService);
  private readonly orderSvc = inject(AdminOrdersService);
  private readonly inventorySvc = inject(AdminInventoryService);

  productStats = { total: 0, inStock: 0, outOfStock: 0, lowStock: 0 };
  orderStats = {
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0,
  };
  inventoryStats = { total: 0, inStock: 0, lowStock: 0, outOfStock: 0 };

  ngOnInit() {
    this.productStats = this.productSvc.getStats();
    this.orderSvc.getStats().subscribe((stats) => (this.orderStats = stats));
    this.inventoryStats = this.inventorySvc.getStats();
  }
}
