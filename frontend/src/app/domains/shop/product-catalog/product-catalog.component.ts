import { Component, inject, computed, signal, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, ActivatedRoute } from "@angular/router";
import { ReactiveFormsModule, FormBuilder } from "@angular/forms";
import { toSignal } from "@angular/core/rxjs-interop";
import { AdminProductService } from "../../admin/products/products.service";
import { CartService } from "../cart/cart.service";
import { Product } from "../../../core/models/product.model";
import { CATEGORIES } from "../../../core/models/category.model";

@Component({
  selector: "app-product-catalog",
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  styleUrl: "./product-catalog.component.scss",
  templateUrl: "./product-catalog.component.html",
})
export class ProductCatalogComponent implements OnInit {
  private readonly productsSvc = inject(AdminProductService);
  private readonly cartSvc = inject(CartService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  readonly categories = CATEGORIES;

  toastMessage = signal<string | null>(null);
  toastError = signal<string | null>(null);

  filterForm = this.fb.group({
    category: [""],
    sortBy: ["newest"],
    search: [""],
  });

  ngOnInit(): void {
    const cat = this.route.snapshot.queryParamMap.get("category");
    if (cat) {
      this.filterForm.patchValue({ category: cat });
    }
  }

  private readonly allProducts = toSignal(this.productsSvc.getAll(), {
    initialValue: [] as Product[],
  });

  private readonly filterValues = toSignal(this.filterForm.valueChanges, {
    initialValue: this.filterForm.value,
  });

  private readonly _filteredProducts = computed(() => {
    const f = this.filterValues();
    let products = this.allProducts();

    if (f.category)
      products = products.filter((p: Product) => p.category === f.category);
    if (f.search) {
      const q = f.search.toLowerCase();
      products = products.filter(
        (p: Product) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }

    if (f.sortBy === "price-asc")
      products = [...products].sort((a, b) => a.price - b.price);
    else if (f.sortBy === "price-desc")
      products = [...products].sort((a, b) => b.price - a.price);
    // No rating sort for herbal products

    return products;
  });

  get filteredProducts(): Product[] {
    return this._filteredProducts();
  }

  resetFilter(): void {
    this.filterForm.reset({
      category: "",
      sortBy: "newest",
      search: "",
    });
  }

  /** How many units of this product are already in the cart */
  getCartQty(productId: string): number {
    return (
      this.cartSvc.cartItems().find((i) => i.product.id === productId)
        ?.quantity ?? 0
    );
  }

  /** Remaining stock for a product (total - in cart) */
  getRemainingStock(product: Product): number {
    return Math.max(0, (product.stockCount ?? 0) - this.getCartQty(product.id));
  }

  addToCart(product: Product): void {
    if (!product.inStock || product.stockCount === 0) return;
    if (this.getRemainingStock(product) <= 0) return;
    this.cartSvc.addToCart(product, "", "", 1);
    this.toastMessage.set(`"${product.name}" added to cart!`);
    this.toastError.set(null);
    setTimeout(() => this.toastMessage.set(null), 2500);
  }
}
