import { Router } from "express";
import ProductModel from "../models/product.model";
import InventoryModel from "../models/inventory.model";

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// Helper: merge live inventory availability into a product plain object.
//
// `product.stockCount` in MongoDB is a static field written at creation time —
// it does NOT reflect reservations.  The Inventory collection is the source of
// truth.  We overwrite `stockCount` with the sum of `variants[*].available`
// and set `inStock` accordingly so the frontend always sees accurate numbers.
// ─────────────────────────────────────────────────────────────────────────────
function mergeAvailability(
  product: Record<string, unknown>,
  inventory: {
    variants: { size: string; available: number }[];
    totalStock: number;
  } | null,
) {
  if (!inventory) return product;
  const available = inventory.variants.reduce(
    (sum, v) => sum + (v.available ?? 0),
    0,
  );
  // Build a per-size available map so the frontend can cap qty per selected size
  const sizeStockMap: Record<string, number> = {};
  for (const v of inventory.variants) {
    sizeStockMap[v.size] = v.available ?? 0;
  }
  return {
    ...product,
    stockCount: available,
    inStock: available > 0,
    sizeStockMap,
  };
}

// GET /api/products - list all products
router.get("/", async (_req, res) => {
  try {
    const products = await ProductModel.find().sort({ createdAt: -1 }).lean();

    // Fetch all inventory docs in one query and build a lookup map
    const productIds = products.map((p) => p._id);
    const inventories = await InventoryModel.find({
      productId: { $in: productIds },
    }).lean();
    const invMap = new Map(
      inventories.map((inv) => [String(inv.productId), inv]),
    );

    const enriched = products.map((p) =>
      mergeAvailability(
        p as unknown as Record<string, unknown>,
        invMap.get(String(p._id)) ?? null,
      ),
    );

    res.json(enriched);
  } catch (err) {
    console.error("Error fetching products", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// POST /api/products - create a new product
router.post("/", async (req, res) => {
  try {
    const body = req.body;

    const requiredFields = [
      "name",
      "slug",
      "description",
      "price",
      "category",
    ] as const;
    for (const field of requiredFields) {
      if (
        body[field] === undefined ||
        body[field] === null ||
        body[field] === ""
      ) {
        return res
          .status(400)
          .json({ message: `Field "${field}" is required` });
      }
    }

    if (
      typeof body.price !== "number" ||
      Number.isNaN(body.price) ||
      body.price < 0
    ) {
      return res
        .status(400)
        .json({ message: 'Field "price" must be a non-negative number' });
    }

    const allowedCategories = ["frocks", "sets"];
    if (!allowedCategories.includes(body.category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    if (!Array.isArray(body.sizes) || body.sizes.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one size must be selected" });
    }

    if (
      typeof body.stockCount !== "number" ||
      Number.isNaN(body.stockCount) ||
      body.stockCount < 1
    ) {
      return res
        .status(400)
        .json({ message: "Total units in stock must be at least 1" });
    }

    const product = await ProductModel.create({
      name: body.name,
      slug: body.slug,
      description: body.description,
      price: body.price,
      originalPrice: body.originalPrice,
      images: body.images ?? [],
      category: body.category,
      ageGroup: body.ageGroup,
      sizes: body.sizes ?? [],
      colors: body.colors ?? [],
      tags: body.tags ?? [],
      badge: body.badge,
      rating: body.rating ?? 0,
      reviewCount: body.reviewCount ?? 0,
      inStock: body.inStock ?? true,
      stockCount: body.stockCount ?? 0,
      isFeatured: body.isFeatured ?? false,
      isNewArrival: body.isNewArrival ?? false,
    });

    // Create initial inventory entry for the product
    const baseSkuPrefix = product.category === "frocks" ? "SKF-FRK" : "SKF-SET";

    const baseSku = `${baseSkuPrefix}-${product._id.toString().slice(-6).toUpperCase()}`;

    // Build one variant per selected size using the per-size stock counts sent from the form
    const sizeStocks: Record<string, number> = body.sizeStocks ?? {};
    const variants = (product.sizes ?? []).map((size: string) => {
      const stock = sizeStocks[size] ?? 0;
      const safeSizeKey = size.replace(/[\s\/]+/g, "-").toUpperCase();
      return {
        size,
        sku: `${baseSku}-${safeSizeKey}`,
        stock,
        reserved: 0,
        available: stock,
      };
    });

    const totalStock = variants.reduce(
      (sum: number, v: { stock: number }) => sum + v.stock,
      0,
    );

    await InventoryModel.create({
      productId: product._id,
      productName: product.name,
      sku: baseSku,
      image: product.images?.[0] ?? "",
      category: product.category,
      variants,
      totalStock,
      lowStockThreshold: 10,
      status:
        totalStock === 0
          ? "out-of-stock"
          : totalStock <= 10
            ? "low-stock"
            : "in-stock",
      lastUpdated: new Date(),
    });

    res.status(201).json(product);
  } catch (err: any) {
    console.error("Error creating product", err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Slug must be unique" });
    }
    res.status(500).json({ message: "Failed to create product" });
  }
});

// GET /api/products/:id - get a single product by MongoDB _id
router.get("/:id", async (req, res) => {
  try {
    const [product, inventory] = await Promise.all([
      ProductModel.findById(req.params.id).lean(),
      InventoryModel.findOne({ productId: req.params.id }).lean(),
    ]);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(
      mergeAvailability(
        product as unknown as Record<string, unknown>,
        inventory,
      ),
    );
  } catch (err) {
    console.error("Error fetching product", err);
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

// PUT /api/products/:id - update a product
router.put("/:id", async (req, res) => {
  try {
    const updates = req.body;
    const product = await ProductModel.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true },
    ).lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ── Sync inventory when stockCount is explicitly updated ─────────────────
    // Always operates on variants[0] — the single pooled slot per product.
    // Preserves any existing reservation: available = newStock - reserved.
    if (typeof updates.stockCount === "number") {
      const inv = await InventoryModel.findOne({
        productId: req.params.id,
      }).lean();
      if (inv) {
        const reserved = inv.variants[0]?.reserved ?? 0;
        const newAvailable = Math.max(0, updates.stockCount - reserved);
        const newStatus =
          newAvailable === 0
            ? "out-of-stock"
            : newAvailable <= inv.lowStockThreshold
              ? "low-stock"
              : "in-stock";

        await InventoryModel.updateOne(
          { productId: req.params.id },
          {
            $set: {
              "variants.0.stock": updates.stockCount,
              "variants.0.available": newAvailable,
              totalStock: updates.stockCount,
              status: newStatus,
              lastUpdated: new Date(),
            },
          },
        );
      }
    }

    // Return the enriched product (live stockCount from inventory)
    const inventory = await InventoryModel.findOne({
      productId: req.params.id,
    }).lean();
    res.json(
      mergeAvailability(
        product as unknown as Record<string, unknown>,
        inventory,
      ),
    );
  } catch (err) {
    console.error("Error updating product", err);
    res.status(500).json({ message: "Failed to update product" });
  }
});

// DELETE /api/products/:id - delete a product
router.delete("/:id", async (req, res) => {
  try {
    const result = await ProductModel.findByIdAndDelete(req.params.id).lean();
    if (!result) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Also delete related inventory entry
    await InventoryModel.deleteOne({ productId: req.params.id });
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting product", err);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

export default router;
