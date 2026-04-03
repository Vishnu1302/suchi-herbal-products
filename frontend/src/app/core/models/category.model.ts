import { ProductCategory } from "./product.model";

export interface Category {
  name: string;
  slug: ProductCategory;
  icon: string;
}

export const CATEGORIES: Category[] = [
  { name: "Oil", slug: "oil", icon: "fa-solid fa-droplet" },
  { name: "Shampoo", slug: "shampoo", icon: "fa-solid fa-pump-soap" },
  { name: "Cream", slug: "cream", icon: "fa-solid fa-jar" },
  { name: "Gel", slug: "gel", icon: "fa-solid fa-flask" },
  { name: "Soap", slug: "soap", icon: "fa-solid fa-soap" },
];
