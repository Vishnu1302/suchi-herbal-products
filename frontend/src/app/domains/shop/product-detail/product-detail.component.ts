import { Component, inject, signal, OnInit } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { AdminProductService } from "../../admin/products/products.service";
import { CartService } from "../cart/cart.service";
import { Product } from "../../../core/models/product.model";
import { CloudinaryUrlPipe } from "../../../shared/pipes/cloudinary-url.pipe";

// Duration (ms) the "Added to cart" toast stays visible
const TOAST_DURATION = 2500;

@Component({
  selector: "app-product-detail",
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, CloudinaryUrlPipe],
  styleUrl: "./product-detail.component.scss",
  templateUrl: "./product-detail.component.html",
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productsSvc = inject(AdminProductService);
  private readonly cartSvc = inject(CartService);
  private readonly fb = inject(FormBuilder);

  product = signal<Product | undefined>(undefined);
  selectedImage = signal("");
  toast = signal(""); // Non-empty = toast is visible
  sizeError = signal(""); // Per-size stock error message

  form: FormGroup = this.fb.group({
    qty: [1, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id") ?? "";
    this.productsSvc.getById(id).subscribe((p) => {
      if (p) {
        this.product.set(p);
        this.selectedImage.set(p.images[0]);
        // No size selection for herbal products
      }
    });
  }

  /** Available stock for the product */
  get availableStock(): number {
    const p = this.product();
    return p?.stockCount ?? 0;
  }

  /** Remaining units that can still be added to cart (stock − already in cart) */
  get remainingStock(): number {
    const p = this.product();
    if (!p) return 0;
    const inCart = this.cartSvc
      .cartItems()
      .filter((item) => item.product.id === p.id)
      .reduce((sum, item) => sum + item.quantity, 0);
    return Math.max(0, (p.stockCount ?? 0) - inCart);
  }

  decQty(): void {
    const current: number = this.form.controls["qty"].value;
    if (current > 1) this.form.controls["qty"].setValue(current - 1);
  }

  incQty(): void {
    const current = this.form.controls["qty"].value as number;
    if (current < this.remainingStock) {
      this.form.controls["qty"].setValue(current + 1);
    }
  }

  addToCart(product: Product): void {
    if (!product.inStock || product.stockCount === 0) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const qty = this.form.controls["qty"].value as number;
    if (qty > this.remainingStock) {
      const plural = this.remainingStock === 1 ? "" : "s";
      const msg =
        this.remainingStock <= 0
          ? `You already have all available units in your cart.`
          : `Only ${this.remainingStock} more unit${plural} can be added.`;
      this.sizeError.set(msg);
      return;
    }
    this.sizeError.set("");
    this.cartSvc.addToCart(product, "", "", qty);
    this.toast.set("✅ Added to cart!");
    setTimeout(() => this.toast.set(""), TOAST_DURATION);
  }

  buyNow(product: Product): void {
    if (!product.inStock || product.stockCount === 0) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const qty = this.form.controls["qty"].value as number;
    if (qty > this.remainingStock) {
      const plural = this.remainingStock === 1 ? "" : "s";
      const msg =
        this.remainingStock <= 0
          ? `You already have all available units in your cart.`
          : `Only ${this.remainingStock} more unit${plural} can be added.`;
      this.sizeError.set(msg);
      return;
    }
    this.sizeError.set("");
    this.cartSvc.addToCart(product, "", "", qty);
    this.router.navigate(["/checkout"]);
  }
}
