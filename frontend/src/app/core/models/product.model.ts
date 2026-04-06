// ProductCategory is owned by category.model.ts — imported here for use in
// this file and re-exported for backward compatibility with existing imports.
import type { ProductCategory } from "./category.model";
export type { ProductCategory } from "./category.model";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  ingredients: string;
  usage: string;
  benefits?: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: ProductCategory;
  inStock: boolean;
  stockCount: number;
}

export interface ProductFilter {
  category?: ProductCategory | "";
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: "price-asc" | "price-desc" | "newest" | "popular";
  search?: string;
}
