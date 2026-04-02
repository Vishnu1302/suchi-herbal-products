import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { ReactiveFormsModule, FormBuilder } from "@angular/forms";
import { AdminOrdersService } from "../orders.service";
import { Order, OrderStatus } from "../../../../core/models/order.model";

@Component({
  selector: "app-order-detail",
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  styleUrl: "./order-detail.component.scss",
  template: `
    <div class="order-detail" *ngIf="order; else loading">
      <div class="page-header">
        <div>
          <h1 class="page-title">Order {{ order.orderNumber }}</h1>
          <p class="page-subtitle">
            Placed on {{ order.createdAt | date: "long" }}
          </p>
        </div>
        <a routerLink="/admin/orders" class="btn-ghost">← Back to Orders</a>
      </div>

      <div class="detail-grid">
        <!-- Left column -->
        <div class="detail-col">
          <!-- Items -->
          <div class="detail-card">
            <h3 class="card-title">🛍️ Order Items</h3>
            <div class="item-row" *ngFor="let item of order.items">
              <img
                [src]="item.image"
                [alt]="item.productName"
                class="item-img"
              />
              <div class="item-info">
                <div class="item-name">{{ item.productName }}</div>
                <div class="item-meta">
                  Qty: {{ item.quantity }} × ₹{{ item.unitPrice }}
                </div>
              </div>
              <div class="item-total">₹{{ item.totalPrice | number }}</div>
            </div>
            <div class="order-totals">
              <div class="total-row">
                <span>Subtotal</span><span>₹{{ order.subtotal | number }}</span>
              </div>
              <div class="total-row">
                <span>Shipping</span
                ><span>{{
                  order.shippingCost === 0 ? "FREE" : "₹" + order.shippingCost
                }}</span>
              </div>
              <div class="total-row">
                <span>Tax</span><span>₹{{ order.tax | number }}</span>
              </div>
              <div class="total-row total-row--grand">
                <span>Total</span><strong>₹{{ order.total | number }}</strong>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div class="detail-card" *ngIf="order.notes">
            <h3 class="card-title">📝 Notes</h3>
            <p class="notes-text">{{ order.notes }}</p>
          </div>
        </div>

        <!-- Right column -->
        <div class="detail-col">
          <!-- Status -->
          <div class="detail-card">
            <h3 class="card-title">📦 Order Status</h3>
            <div class="status-row">
              <span class="status-label">Order Status</span>
              <span [class]="'status-badge status--' + order.status">{{
                order.status | titlecase
              }}</span>
            </div>
            <div class="status-row">
              <span class="status-label">Payment</span>
              <span [class]="'pay-badge pay--' + order.paymentStatus">{{
                order.paymentStatus | titlecase
              }}</span>
            </div>
            <div class="status-row">
              <span class="status-label">Method</span>
              <span>{{ order.paymentMethod }}</span>
            </div>
            <!-- Status update -->
            <div class="status-update" [formGroup]="statusForm">
              <label class="form-label">Update Status</label>
              <select class="form-select" formControlName="status">
                <option *ngFor="let s of statusOptions" [value]="s">
                  {{ s | titlecase }}
                </option>
              </select>
              <button
                class="update-btn"
                (click)="updateStatus()"
                [disabled]="saving"
              >
                {{ saving ? "Updating..." : "Update" }}
              </button>
            </div>
          </div>

          <!-- Customer -->
          <div class="detail-card">
            <h3 class="card-title">👤 Customer</h3>
            <div class="info-line">
              <strong>{{ order.customerName }}</strong>
            </div>
            <div class="info-line muted">{{ order.customerEmail }}</div>
          </div>

          <!-- Shipping address -->
          <div class="detail-card">
            <h3 class="card-title">🏠 Shipping Address</h3>
            <div class="info-line">{{ order.shippingAddress.fullName }}</div>
            <div class="info-line">{{ order.shippingAddress.line1 }}</div>
            <div class="info-line" *ngIf="order.shippingAddress.line2">
              {{ order.shippingAddress.line2 }}
            </div>
            <div class="info-line">
              {{ order.shippingAddress.city }},
              {{ order.shippingAddress.state }} –
              {{ order.shippingAddress.pinCode }}
            </div>
            <div class="info-line">{{ order.shippingAddress.country }}</div>
            <div class="info-line muted">
              📞 {{ order.shippingAddress.phone }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <ng-template #loading>
      <div class="loading">Loading order details...</div>
    </ng-template>
  `,
})
export class OrderDetailComponent implements OnInit {
  private readonly svc = inject(AdminOrdersService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  order: Order | undefined;
  saving = false;

  statusOptions: OrderStatus[] = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "returned",
  ];

  statusForm = this.fb.group({
    status: ["pending" as OrderStatus],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id")!;
    this.svc.getById(id).subscribe((o) => {
      this.order = o;
      if (o) this.statusForm.controls["status"].setValue(o.status);
    });
  }

  updateStatus(): void {
    if (!this.order) return;
    this.saving = true;
    const status = this.statusForm.controls["status"].value as OrderStatus;
    this.svc.updateStatus(this.order.id, status).subscribe((updated) => {
      this.order = updated;
      this.saving = false;
    });
  }
}
