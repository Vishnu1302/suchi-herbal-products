import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AdminInventoryService } from "../inventory.service";
import { InventoryItem } from "../../../../core/models/inventory.model";

@Component({
  selector: "app-inventory-list",
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrl: "./inventory-list.component.scss",
  template: `
    <div class="inventory">
      <div class="page-header">
        <div>
          <h1 class="page-title">Inventory</h1>
          <p class="page-subtitle">Manage stock levels for all products</p>
        </div>
        <div class="inv-summary">
          <span class="chip chip--green">✅ In Stock: {{ stats.inStock }}</span>
          <span class="chip chip--yellow">⚠️ Low: {{ stats.lowStock }}</span>
          <span class="chip chip--red">❌ Out: {{ stats.outOfStock }}</span>
        </div>
      </div>

      <div class="inv-grid">
        <div class="inv-card" *ngFor="let item of inventory">
          <!-- Top: image + name + current stock badge -->
          <div class="inv-card__top">
            <img [src]="item.image" [alt]="item.productName" class="inv-img" />
            <div class="inv-info">
              <div class="inv-name">{{ item.productName }}</div>
              <div class="inv-sku">SKU: {{ item.sku }}</div>
              <span [class]="'status-dot ' + getStatusClass(item.status)">
                {{ item.status | titlecase }}
              </span>
            </div>
            <div class="inv-stock-badge">
              <span class="stock-num" [class]="getStatusClass(item.status)">{{
                item.stock
              }}</span>
              <span class="stock-lbl">units</span>
            </div>
          </div>

          <!-- Divider -->
          <div class="inv-divider"></div>

          <!-- Update section -->
          <div class="inv-card__update">
            <label class="update-label">Set new stock quantity</label>
            <div class="qty-row">
              <button
                class="qty-step"
                type="button"
                (click)="
                  updates[item.productId] =
                    (updates[item.productId] ?? item.stock) > 0
                      ? (updates[item.productId] ?? item.stock) - 1
                      : 0
                "
              >
                −
              </button>
              <input
                type="number"
                class="qty-input"
                [(ngModel)]="updates[item.productId]"
                [min]="0"
                [placeholder]="item.stock.toString()"
              />
              <button
                class="qty-step"
                type="button"
                (click)="
                  updates[item.productId] =
                    (updates[item.productId] ?? item.stock) + 1
                "
              >
                +
              </button>
            </div>
            <p class="qty-hint">
              ⚠️ Low stock alert below {{ item.lowStockThreshold }} units
            </p>
            <button
              class="save-btn"
              [disabled]="
                saving[item.productId] ||
                updates[item.productId] == null ||
                updates[item.productId]! < 0
              "
              (click)="updateStock(item)"
            >
              <span *ngIf="!saving[item.productId]">Update Stock</span>
              <span *ngIf="saving[item.productId]">Saving…</span>
            </button>
            <p class="success-msg" *ngIf="saved[item.productId]">
              ✅ Stock updated!
            </p>
          </div>

          <div class="inv-card__footer">
            Last updated: {{ item.lastUpdated | date: "d MMM yyyy" }}
          </div>
        </div>
      </div>
    </div>
  `,
})
export class InventoryListComponent implements OnInit {
  private readonly svc = inject(AdminInventoryService);
  inventory: InventoryItem[] = [];
  stats = { total: 0, inStock: 0, lowStock: 0, outOfStock: 0 };
  updates: Record<string, number | undefined> = {};
  saving: Record<string, boolean> = {};
  saved: Record<string, boolean> = {};

  ngOnInit() {
    this.svc.getAll().subscribe((items) => {
      this.inventory = items;
      this.stats = this.svc.getStats();
    });
  }

  getStatusClass(status: string): string {
    return `dot--${status}`;
  }

  updateStock(item: InventoryItem) {
    const newStock = this.updates[item.productId];
    if (newStock === undefined || newStock === null) return;
    this.saving[item.productId] = true;
    this.svc
      .updateStock({
        productId: item.productId,
        newStock,
        reason: "Manual update",
      })
      .subscribe({
        next: (updated) => {
          const idx = this.inventory.findIndex(
            (i) => i.productId === updated.productId,
          );
          if (idx > -1) this.inventory[idx] = updated;
          this.stats = this.svc.getStats();
          delete this.updates[item.productId];
          this.saving[item.productId] = false;
          this.saved[item.productId] = true;
          setTimeout(() => (this.saved[item.productId] = false), 2500);
        },
        error: (err) => {
          this.saving[item.productId] = false;
          const msg =
            err?.error?.message ?? "Failed to update stock. Please try again.";
          alert(msg);
        },
      });
  }
}
