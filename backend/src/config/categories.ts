// ─── Single source of truth for product categories (backend) ─────────────────
// To add a category: add one slug here. All Mongoose enums and route
// validators derive from this array — no other backend file needs updating.

export const CATEGORY_SLUGS = [
  "oil",
  "shampoo",
  "cream",
  "serum",
  "soap",
] as const;

export type ProductCategory = (typeof CATEGORY_SLUGS)[number];
