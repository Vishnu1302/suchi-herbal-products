import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { AdminOrdersService } from "../orders.service";
import { Order, OrderStatus } from "../../../../core/models/order.model";

@Component({
  selector: "app-order-list",
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="order-list">
      <div class="page-header">
        <div>
          <h1 class="page-title">Orders</h1>
          <p class="page-subtitle">{{ orders.length }} orders total</p>
        </div>
      </div>

      <!-- Status filter tabs -->
      <div class="status-tabs">
        <button
          *ngFor="let tab of tabs"
          class="tab-btn"
          [class.tab-btn--active]="activeTab === tab.value"
          (click)="setTab(tab.value)"
        >
          {{ tab.label }}
          <span class="tab-count">{{ getCount(tab.value) }}</span>
        </button>
      </div>

      <!-- Table -->
      <div class="table-card">
        <table class="table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let o of filteredOrders">
              <td>
                <strong>{{ o.orderNumber }}</strong>
              </td>
              <td>
                <div class="customer-name">{{ o.customerName }}</div>
                <div class="customer-email">{{ o.customerEmail }}</div>
              </td>
              <td>{{ o.items.length }} item(s)</td>
              <td>
                <strong>₹{{ o.total | number }}</strong>
              </td>
              <td>
                <span [class]="'pay-badge pay--' + o.paymentStatus">
                  {{ o.paymentStatus | titlecase }}
                </span>
              </td>
              <td>
                <select
                  class="status-select"
                  [value]="o.status"
                  (change)="updateStatus(o.id, $any($event.target).value)"
                >
                  <option *ngFor="let s of statusOptions" [value]="s">
                    {{ s | titlecase }}
                  </option>
                </select>
              </td>
              <td class="date-cell">{{ o.createdAt | date: "dd MMM yyyy" }}</td>
              <td>
                <a [routerLink]="['/admin/orders', o.id]" class="view-btn"
                  >View</a
                >
              </td>
            </tr>
          </tbody>
        </table>
        <div class="empty-state" *ngIf="filteredOrders.length === 0">
          No orders found for this status.
        </div>
      </div>
    </div>
  `,
  styleUrl: "./order-list.component.scss",
})
export class OrderListComponent implements OnInit {
  private svc = inject(AdminOrdersService);
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  activeTab = "all";
  tabCounts: Map<string, number> = new Map();

  tabs = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Processing", value: "processing" },
    { label: "Shipped", value: "shipped" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
  ];

  statusOptions: OrderStatus[] = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "returned",
  ];

  ngOnInit() {
    this.svc.getAll().subscribe((o) => {
      this.orders = o;
      this.filter();
    });
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.filter();
  }

  filter() {
    this.filteredOrders =
      this.activeTab === "all"
        ? this.orders
        : this.orders.filter((o: Order) => o.status === this.activeTab);

    // Recompute counts once per filter call, not once per tab badge
    this.tabCounts = new Map(
      this.tabs.map((t) => [
        t.value,
        t.value === "all"
          ? this.orders.length
          : this.orders.filter((o: Order) => o.status === t.value).length,
      ]),
    );
  }

  getCount(tab: string): number {
    return this.tabCounts.get(tab) ?? 0;
  }

  updateStatus(id: string, status: OrderStatus) {
    this.svc.updateStatus(id, status).subscribe((updated) => {
      const idx = this.orders.findIndex((o) => o.id === id);
      if (idx > -1) this.orders[idx] = updated;
      this.filter();
    });
  }
}
