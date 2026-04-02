import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { Product } from "../../../core/models/product.model";
import { CATEGORIES } from "../../../core/models/category.model";
import { AdminProductService } from "../../admin/products/products.service";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule, RouterLink],
  styleUrl: "./home.component.scss",
  templateUrl: "./home.component.html",
})
export class HomeComponent implements OnInit {
  private readonly productsSvc = inject(AdminProductService);

  featured: Product[] = [];
  newArrivals: Product[] = [];
  bestSellers: Product[] = [];
  currentYear = new Date().getFullYear();
  categories = CATEGORIES;

  ngOnInit(): void {
    this.productsSvc.getAll().subscribe((products) => {
      // Herbal: New Arrivals = first 8 products
      this.newArrivals = products.slice(0, 8);
      // Herbal: Best Sellers = top 8 by stockCount
      this.bestSellers = [...products]
        .sort((a, b) => (b.stockCount ?? 0) - (a.stockCount ?? 0))
        .slice(0, 8);
    });
  }
}
