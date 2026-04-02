import { ProductCategory } from "./product.model";

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export interface InventoryItem {
  productId: string;
  productName: string;
  sku: string;
  image: string;
  category: ProductCategory;
  stock: number;
  lowStockThreshold: number;
  status: StockStatus;
  lastUpdated: Date;
}

export interface StockUpdatePayload {
  productId: string;
  newStock: number;
  reason: string;
}
