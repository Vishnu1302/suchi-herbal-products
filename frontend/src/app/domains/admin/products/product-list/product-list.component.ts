import { Component, OnInit, OnDestroy, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { Subject, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged, switchMap } from "rxjs/operators";
import { AdminProductService } from "../products.service";
import {
  Product,
  ProductCategory,
} from "../../../../core/models/product.model";
import { Category, CATEGORIES } from "../../../../core/models/category.model";

@Component({
  selector: "app-product-list",
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: "./product-list.component.html",
  styleUrl: "./product-list.component.scss",
})
export class ProductListComponent implements OnInit, OnDestroy {
  private readonly svc = inject(AdminProductService);
  private readonly searchSubject = new Subject<string>();
  private readonly subscriptions = new Subscription();

  products: Product[] = [];
  searchQuery = "";
  categoryFilter: ProductCategory | "" = "";
  readonly categories: Category[] = CATEGORIES;

  ngOnInit() {
    // Debounce text input — fires HTTP only after 300 ms of inactivity
    this.subscriptions.add(
      this.searchSubject
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap(() =>
            this.svc.getAll({
              search: this.searchQuery,
              category: this.categoryFilter,
            }),
          ),
        )
        .subscribe((p) => (this.products = p)),
    );

    this.load();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  load() {
    this.svc
      .getAll({ search: this.searchQuery, category: this.categoryFilter })
      .subscribe((p) => (this.products = p));
  }

  onSearchInput() {
    this.searchSubject.next(this.searchQuery);
  }

  onSearch() {
    this.load();
  }

  trackById(_index: number, p: Product): string {
    return p.id;
  }

  getStockClass(p: Product): string {
    if (p.stockCount === 0) return "stock--none";
    if (p.stockCount <= 10) return "stock--low";
    return "stock--ok";
  }

  deleteProduct(id: string) {
    if (confirm("Delete this product? This cannot be undone.")) {
      this.svc.delete(id).subscribe({
        next: () => this.load(),
        error: () => alert("Failed to delete product. Please try again."),
      });
    }
  }
}
