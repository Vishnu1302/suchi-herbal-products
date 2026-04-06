// ─── Single source of truth for all categories ───────────────────────────────
// To add a category: add one entry to CATEGORIES AND the slug to
// ProductCategory. To remove: delete from both.

export interface Category {
  name: string;
  slug: string;
  icon: string; // FontAwesome class string
}

export const CATEGORIES: Category[] = [
  { name: "Oil", slug: "oil", icon: "fa-solid fa-droplet" },
  { name: "Shampoo", slug: "shampoo", icon: "fa-solid fa-pump-soap" },
  { name: "Cream", slug: "cream", icon: "fa-solid fa-jar" },
  { name: "Serum", slug: "serum", icon: "fa-solid fa-vial" },
  { name: "Soap", slug: "soap", icon: "fa-solid fa-soap" },
];

// Keep in sync with CATEGORIES above.
export type ProductCategory = "oil" | "shampoo" | "cream" | "serum" | "soap";
