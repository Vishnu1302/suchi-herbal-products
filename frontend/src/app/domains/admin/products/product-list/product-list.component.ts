import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { AdminProductService } from "../products.service";
import {
  Product,
  ProductCategory,
} from "../../../../core/models/product.model";

@Component({
  selector: "app-product-list",
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="product-list">
      <div class="page-header">
        <div>
          <h1 class="page-title">Products</h1>
          <p class="page-subtitle">
            {{ products.length }} products in catalogue
          </p>
        </div>
        <a routerLink="/admin/products/new" class="btn-primary"
          >➕ Add Product</a
        >
      </div>

      <!-- Search & Filter -->
      <div class="toolbar">
        <input
          class="search-input"
          type="text"
          placeholder="🔍 Search products..."
          [(ngModel)]="searchQuery"
          (input)="onSearch()"
        />
        <select
          class="filter-select"
          [(ngModel)]="categoryFilter"
          (change)="onSearch()"
        >
          <option value="">All Categories</option>
          <option value="powder">Powder</option>
          <option value="oil">Oil</option>
          <option value="capsule">Capsule</option>
          <option value="tea">Tea</option>
          <option value="extract">Extract</option>
          <option value="herb">Herb</option>
          <option value="other">Other</option>
        </select>
      </div>

      <!-- Table -->
      <div class="table-card">
        <table class="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of products">
              <td>
                <div class="product-cell">
                  <img [src]="p.images[0]" [alt]="p.name" class="product-img" />
                  <div>
                    <div class="product-name">{{ p.name }}</div>
                    <div class="product-id">{{ p.id }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="tag">{{ p.category }}</span>
              </td>
              <td>
                <div class="price">₹{{ p.price }}</div>
                <div class="original-price" *ngIf="p.originalPrice">
                  ₹{{ p.originalPrice }}
                </div>
              </td>
              <td>
                <div class="stock-total">
                  <span [class]="'stock-badge ' + getStockClass(p)">
                    {{ p.stockCount }} units
                  </span>
                </div>
              </td>
              <td>
                <span
                  [class]="
                    'status-badge ' +
                    (p.inStock && p.stockCount > 0
                      ? 'status--active'
                      : 'status--inactive')
                  "
                >
                  {{
                    p.inStock && p.stockCount > 0 ? "Active" : "Out of Stock"
                  }}
                </span>
              </td>
              <td>
                <div class="actions">
                  <a
                    [routerLink]="['/admin/products', p.id, 'edit']"
                    class="action-btn action-btn--edit"
                    >✏️</a
                  >
                  <button
                    class="action-btn action-btn--delete"
                    (click)="deleteProduct(p.id)"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="empty-state" *ngIf="products.length === 0">
          <p>No products found.</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24px;
      }
      .page-title {
        font-size: 1.8rem;
        font-weight: 800;
      }
      .page-subtitle {
        color: #888;
        margin-top: 4px;
      }
      .btn-primary {
        padding: 12px 20px;
        background: var(--color-primary);
        color: #fff;
        border-radius: 10px;
        font-weight: 700;
        text-decoration: none;
        &:hover {
          background: var(--color-primary-dark);
        }
      }
      .toolbar {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
      }
      .search-input,
      .filter-select {
        padding: 10px 16px;
        border: 1.5px solid #f0e0d6;
        border-radius: 10px;
        font-family: inherit;
        font-size: 0.9rem;
        outline: none;
        &:focus {
          border-color: #ff6b6b;
        }
      }
      .search-input {
        flex: 1;
      }
      .table-card {
        background: #fff;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
      }
      .table {
        width: 100%;
        border-collapse: collapse;
      }
      th {
        padding: 14px 16px;
        text-align: left;
        font-size: 0.8rem;
        color: #888;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 1px solid #f5f5f5;
      }
      td {
        padding: 14px 16px;
        border-bottom: 1px solid #f5f5f5;
        font-size: 0.9rem;
        vertical-align: middle;
      }
      .product-cell {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .product-img {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        object-fit: cover;
      }
      .product-name {
        font-weight: 700;
      }
      .product-id {
        font-size: 0.75rem;
        color: #aaa;
      }
      .price {
        font-weight: 700;
      }
      .original-price {
        font-size: 0.75rem;
        color: #aaa;
        text-decoration: line-through;
      }
      .tag {
        background: #f0f4ff;
        color: #5566aa;
        padding: 3px 10px;
        border-radius: 999px;
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: capitalize;
      }
      .stock-badge {
        padding: 3px 10px;
        border-radius: 999px;
        font-size: 0.8rem;
        font-weight: 700;
      }
      .stock--ok {
        background: #e8f8ea;
        color: #2e7d32;
      }
      .stock--low {
        background: #fff8e1;
        color: #f57f17;
      }
      .stock--none {
        background: #fde8e8;
        color: #c62828;
      }
      .size-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 6px;
      }
      .size-tag {
        background: #f0e8ff;
        color: #7412bf;
        padding: 2px 7px;
        border-radius: 999px;
        font-size: 0.72rem;
        font-weight: 600;
        white-space: nowrap;
      }
      .status-badge {
        padding: 3px 10px;
        border-radius: 999px;
        font-size: 0.8rem;
        font-weight: 700;
      }
      .status--active {
        background: #e8f8ea;
        color: #2e7d32;
      }
      .status--inactive {
        background: #fde8e8;
        color: #c62828;
      }
      .actions {
        display: flex;
        gap: 8px;
      }
      .action-btn {
        padding: 6px 10px;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        font-size: 1rem;
        background: #f5f5f5;
        text-decoration: none;
        transition: 0.2s;
        &:hover {
          opacity: 0.75;
        }
      }
      .action-btn--edit {
        background: #e8f0fe;
      }
      .action-btn--delete {
        background: #fde8e8;
      }
      .empty-state {
        padding: 48px;
        text-align: center;
        color: #aaa;
      }
    `,
  ],
})
export class ProductListComponent implements OnInit {
  private readonly svc = inject(AdminProductService);
  products: Product[] = [];
  searchQuery = "";
  categoryFilter: ProductCategory | "" = "";

  ngOnInit() {
    this.load();
  }

  load() {
    this.svc
      .getAll({
        search: this.searchQuery,
        category: this.categoryFilter,
      })
      .subscribe((p) => (this.products = p));
  }

  onSearch() {
    this.load();
  }

  getStockClass(p: Product): string {
    if (p.stockCount === 0) return "stock--none";
    if (p.stockCount <= 10) return "stock--low";
    return "stock--ok";
  }

  deleteProduct(id: string) {
    if (confirm("Delete this product?")) {
      this.svc.delete(id).subscribe(() => this.load());
    }
  }
}
