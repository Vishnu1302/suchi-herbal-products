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
        <!-- Summary chips -->
        <div class="inv-summary">
          <span class="chip chip--green">✅ In Stock: {{ stats.inStock }}</span>
          <span class="chip chip--yellow">⚠️ Low: {{ stats.lowStock }}</span>
          <span class="chip chip--red">❌ Out: {{ stats.outOfStock }}</span>
        </div>
      </div>

      <!-- Inventory cards -->
      <div class="inv-grid">
        <div class="inv-card" *ngFor="let item of inventory">
          <div class="inv-card__header">
            <img [src]="item.image" [alt]="item.productName" class="inv-img" />
            <div>
              <div class="inv-name">{{ item.productName }}</div>
              <div class="inv-sku">{{ item.sku }}</div>
              <span [class]="'status-dot ' + getStatusClass(item.status)">
                {{ item.status | titlecase }}
              </span>
            </div>
            <div class="inv-total">
              <span class="total-num">{{ item.stock }}</span>
              <span class="total-lbl">units</span>
            </div>
          </div>

          <div class="inv-card__body">
            <div class="update-row">
              <label>Update Stock:</label>
              <input
                type="number"
                class="qty-input"
                [(ngModel)]="updates[item.productId]"
                [min]="0"
                [placeholder]="item.stock"
              />
              <button
                class="save-btn"
                [disabled]="saving[item.productId]"
                (click)="updateStock(item)"
              >
                {{ saving[item.productId] ? "Saving..." : "Save" }}
              </button>
            </div>
            <p class="qty-hint">
              Low stock threshold: {{ item.lowStockThreshold }} units
            </p>
          </div>

          <div class="inv-card__footer">
            Last updated: {{ item.lastUpdated | date: "mediumDate" }}
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
  updates: Record<string, number> = {};
  saving: Record<string, boolean> = {};

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
        },
        error: () => {
          this.saving[item.productId] = false;
          alert("Failed to update inventory. Please try again.");
        },
      });
  }
}
