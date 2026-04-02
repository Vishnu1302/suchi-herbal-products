import { ProductCategory } from "./product.model";

export interface Category {
  name: string;
  slug: ProductCategory;
  icon: string;
}

export const CATEGORIES: Category[] = [
  { name: "Powder", slug: "powder", icon: "fa-solid fa-mortar-pestle" },
  { name: "Oil", slug: "oil", icon: "fa-solid fa-droplet" },
  { name: "Capsule", slug: "capsule", icon: "fa-solid fa-capsules" },
  { name: "Tea", slug: "tea", icon: "fa-solid fa-mug-hot" },
  { name: "Extract", slug: "extract", icon: "fa-solid fa-flask" },
  { name: "Herb", slug: "herb", icon: "fa-solid fa-leaf" },
  { name: "Other", slug: "other", icon: "fa-solid fa-box" },
];
