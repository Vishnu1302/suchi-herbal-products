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
          <option value="oil">Oil</option>
          <option value="shampoo">Shampoo</option>
          <option value="cream">Cream</option>
          <option value="gel">Gel</option>
          <option value="soap">Soap</option>
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
        color: #9e9470;
        margin-top: 4px;
      }
      .btn-primary {
        padding: 12px 20px;
        background: linear-gradient(to right, #b8860b, #d4af37);
        color: #1a1000;
        border-radius: 10px;
        font-weight: 700;
        text-decoration: none;
        display: inline-block;
      }
      .toolbar {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
      }
      .search-input,
      .filter-select {
        padding: 10px 16px;
        border: 1.5px solid rgba(212, 175, 55, 0.25);
        border-radius: 10px;
        font-family: inherit;
        font-size: 0.9rem;
        outline: none;
        background: #182018;
        color: #f0edd8;
        &:focus {
          border-color: #d4af37;
        }
      }
      .search-input {
        flex: 1;
      }
      .table-card {
        background: #0f1710;
        border: 1px solid rgba(212, 175, 55, 0.15);
        border-radius: 16px;
        overflow: hidden;
        overflow-x: auto;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
      }
      .table {
        width: 100%;
        border-collapse: collapse;
        min-width: 600px;
      }
      th {
        padding: 14px 16px;
        text-align: left;
        font-size: 0.8rem;
        color: #9e9470;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 1px solid rgba(212, 175, 55, 0.1);
        background: #0d1510;
      }
      td {
        padding: 14px 16px;
        border-bottom: 1px solid rgba(212, 175, 55, 0.06);
        font-size: 0.9rem;
        vertical-align: middle;
        color: #f0edd8;
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
        color: #f0edd8;
      }
      .product-id {
        font-size: 0.75rem;
        color: #9e9470;
      }
      .price {
        font-weight: 700;
        color: #d4af37;
      }
      .original-price {
        font-size: 0.75rem;
        color: #9e9470;
        text-decoration: line-through;
      }
      .tag {
        background: rgba(212, 175, 55, 0.12);
        color: #d4af37;
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
        background: rgba(107, 174, 117, 0.15);
        color: #6bae75;
      }
      .stock--low {
        background: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
      }
      .stock--none {
        background: rgba(239, 68, 68, 0.15);
        color: #ef4444;
      }
      .size-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 6px;
      }
      .size-tag {
        background: rgba(212, 175, 55, 0.12);
        color: #d4af37;
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
        background: rgba(107, 174, 117, 0.15);
        color: #6bae75;
      }
      .status--inactive {
        background: rgba(239, 68, 68, 0.15);
        color: #ef4444;
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
        background: rgba(212, 175, 55, 0.1);
        text-decoration: none;
        transition: 0.2s;
        &:hover {
          opacity: 0.85;
          background: rgba(212, 175, 55, 0.2);
        }
      }
      .action-btn--edit {
        background: rgba(212, 175, 55, 0.1);
      }
      .action-btn--delete {
        background: rgba(239, 68, 68, 0.1);
      }
      .empty-state {
        padding: 48px;
        text-align: center;
        color: #9e9470;
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
