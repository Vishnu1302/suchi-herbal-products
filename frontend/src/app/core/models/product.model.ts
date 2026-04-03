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

export type ProductCategory = "oil" | "shampoo" | "cream" | "gel" | "soap";

export interface ProductFilter {
  category?: ProductCategory | "";
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: "price-asc" | "price-desc" | "newest" | "popular";
  search?: string;
}
