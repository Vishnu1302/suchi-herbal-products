import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
  AbstractControlOptions,
} from "@angular/forms";
import { Router, ActivatedRoute, RouterLink } from "@angular/router";
import { AdminProductService } from "../products.service";
import { environment } from "../../../../../environments/environment";
import { CATEGORIES } from "../../../../core/models/category.model";

function originalPriceValidator(
  group: AbstractControl,
): ValidationErrors | null {
  const price = group.get("price")?.value as number;
  const originalPrice = group.get("originalPrice")?.value as number | null;
  if (
    originalPrice !== null &&
    originalPrice !== undefined &&
    originalPrice <= price
  ) {
    return { originalPriceTooLow: true };
  }
  return null;
}

@Component({
  selector: "app-product-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="product-form">
      <div class="page-header">
        <div>
          <h1 class="page-title">
            {{ isEditMode ? "Edit Product" : "Add New Product" }}
          </h1>
          <p class="page-subtitle">
            {{
              isEditMode
                ? "Update product details below"
                : "Fill in the details to add a product"
            }}
          </p>
        </div>
        <a routerLink="/admin/products" class="btn-ghost"> Back to Products</a>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" class="form-card">
        <div class="form-grid">
          <!-- Name -->
          <div class="form-group form-group--full">
            <label class="form-label">Product Name *</label>
            <input
              class="form-input"
              formControlName="name"
              placeholder="e.g. Ashwagandha Root Powder"
            />
            <span
              class="form-error"
              *ngIf="form.get('name')?.invalid && form.get('name')?.touched"
              >Name is required</span
            >
          </div>

          <!-- Description -->
          <div class="form-group form-group--full">
            <label class="form-label">Description *</label>
            <textarea
              class="form-input form-textarea"
              formControlName="description"
              rows="3"
              placeholder="Describe the product..."
            ></textarea>
          </div>

          <!-- Price -->
          <div class="form-group">
            <label class="form-label">Price (&#8377;) *</label>
            <input
              class="form-input"
              type="number"
              formControlName="price"
              placeholder="349"
            />
          </div>

          <!-- Category -->
          <div class="form-group">
            <label class="form-label">Category *</label>
            <select class="form-input" formControlName="category">
              <option value="">Select category</option>
              <option *ngFor="let cat of categories" [value]="cat.slug">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- Original Price (optional, for sale items) -->
          <div class="form-group">
            <label class="form-label">Original Price (&#8377;)</label>
            <input
              class="form-input"
              type="number"
              formControlName="originalPrice"
              placeholder="0"
            />
            <p class="form-hint">
              Optional. Set a higher original price to display a discount.
            </p>
          </div>

          <!-- Stock Count -->
          <div class="form-group">
            <label class="form-label">Stock Count *</label>
            <input
              class="form-input"
              type="number"
              formControlName="stockCount"
              min="0"
              placeholder="0"
            />
          </div>

          <!-- Image Upload -->
          <div class="form-group form-group--full">
            <label class="form-label">Product Image</label>

            <!-- File picker -->
            <div class="upload-area">
              <input
                type="file"
                id="imgPicker"
                class="upload-input"
                accept="image/*"
                (change)="onFileSelected($event)"
              />
              <label for="imgPicker" class="upload-label">
                <span *ngIf="!selectedFile">&#128193; Choose image file</span>
                <span *ngIf="selectedFile"
                  >&#9989; {{ selectedFile.name }}</span
                >
              </label>
            </div>

            <!-- Local preview before submission -->
            <div class="image-preview" *ngIf="previewUrl">
              <img [src]="previewUrl" alt="Preview" />
              <button type="button" class="remove-btn" (click)="clearImage()">
                &#x2715; Remove
              </button>
            </div>

            <!-- Fallback: paste URL directly -->
            <div class="url-fallback">
              <label class="form-label">Or paste an image URL</label>
              <input
                class="form-input"
                formControlName="imageUrl"
                placeholder="https://..."
              />
            </div>

            <span class="form-error" *ngIf="uploadError">{{
              uploadError
            }}</span>
          </div>

          <!-- Toggles -->
          <div class="form-group form-group--full toggle-row">
            <label class="toggle-label">
              <input type="checkbox" formControlName="inStock" />
              <span>In Stock</span>
            </label>
          </div>
        </div>

        <div class="form-actions">
          <a routerLink="/admin/products" class="btn-ghost">Cancel</a>
          <button
            type="submit"
            class="btn-primary"
            [disabled]="form.invalid || saving"
          >
            {{
              saving
                ? "Saving..."
                : isEditMode
                  ? "Update Product"
                  : "Add Product"
            }}
          </button>
        </div>

        <div class="success-msg" *ngIf="successMsg">
          &#9989; {{ successMsg }}
        </div>
      </form>
    </div>
  `,
  styleUrls: ["./product-form.component.scss"],
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly svc = inject(AdminProductService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);

  categories = CATEGORIES;

  isEditMode = false;
  saving = false;
  successMsg = "";
  productId: string | null = null;
  uploadError = "";

  // Holds the local file before submission  NOT uploaded until form submits
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  form = this.fb.group(
    {
      name: ["", Validators.required],
      description: ["", Validators.required],
      price: [0, [Validators.required, Validators.min(1)]],
      originalPrice: [null as number | null],
      category: ["", Validators.required],
      stockCount: [0, Validators.required],
      imageUrl: [""],
      inStock: [true],
    },
    { validators: originalPriceValidator } as AbstractControlOptions,
  );

  ngOnInit() {
    this.productId = this.route.snapshot.paramMap.get("id");
    if (this.productId) {
      this.isEditMode = true;
      this.svc.getById(this.productId).subscribe((p) => {
        if (p) {
          this.form.patchValue({
            name: p.name,
            description: p.description,
            price: p.price,
            originalPrice: p.originalPrice ?? null,
            category: p.category,
            stockCount: p.stockCount,
            imageUrl: p.images[0] ?? "",
            inStock: p.inStock,
          });
        }
      });
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.selectedFile = file;
    this.previewUrl = URL.createObjectURL(file);
    this.uploadError = "";
    this.form.patchValue({ imageUrl: "" });
  }

  clearImage() {
    this.selectedFile = null;
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = null;
    }
    this.uploadError = "";
  }

  submit() {
    if (this.form.invalid) return;
    this.saving = true;
    this.uploadError = "";

    if (this.selectedFile) {
      const formData = new FormData();
      formData.append("image", this.selectedFile);
      this.http
        .post<{ url: string }>(`${environment.apiUrl}/uploads/image`, formData)
        .subscribe({
          next: (res) => {
            this.form.patchValue({ imageUrl: res.url });
            this.saveProduct();
          },
          error: () => {
            this.saving = false;
            this.uploadError = "Image upload failed. Product not saved.";
          },
        });
    } else {
      this.saveProduct();
    }
  }

  private saveProduct() {
    const val = this.form.value;
    const payload: any = {
      name: val.name!,
      slug: val.name!.toLowerCase().replaceAll(/\s+/g, "-"),
      description: val.description!,
      price: val.price!,
      originalPrice: val.originalPrice ?? undefined,
      category: val.category!,
      stockCount: val.stockCount!,
      images: val.imageUrl ? [val.imageUrl] : [],
      inStock: val.inStock!,
    };

    const call =
      this.isEditMode && this.productId
        ? this.svc.update(this.productId, payload)
        : this.svc.create(payload);

    call.subscribe({
      next: () => {
        this.saving = false;
        this.successMsg = this.isEditMode
          ? "Product updated!"
          : "Product added!";
        setTimeout(() => this.router.navigate(["/admin/products"]), 1200);
      },
      error: () => {
        this.saving = false;
        this.uploadError = "Failed to save product. Please try again.";
      },
    });
  }
}
