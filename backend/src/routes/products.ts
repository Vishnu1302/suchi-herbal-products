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
  inventory: { stock: number } | null,
) {
  if (!inventory) return product;
  return {
    ...product,
    stockCount: inventory.stock,
    inStock: inventory.stock > 0,
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
      "ingredients",
      "usage",
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

    const allowedCategories = ["oil", "shampoo", "cream", "gel", "soap"];
    if (!allowedCategories.includes(body.category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const product = await ProductModel.create({
      name: body.name,
      slug: body.slug,
      description: body.description,
      ingredients: body.ingredients,
      usage: body.usage,
      benefits: body.benefits ?? "",
      price: body.price,
      originalPrice: body.originalPrice,
      images: body.images ?? [],
      category: body.category,
      inStock: body.inStock ?? true,
      stockCount: body.stockCount ?? 0,
    });

    // Create initial inventory entry
    const baseSku = `VED-${product.category.toUpperCase()}-${product._id.toString().slice(-6).toUpperCase()}`;
    const stock: number = body.stockCount ?? 0;
    let stockStatus: "in-stock" | "low-stock" | "out-of-stock";
    if (stock === 0) stockStatus = "out-of-stock";
    else if (stock <= 10) stockStatus = "low-stock";
    else stockStatus = "in-stock";

    await InventoryModel.create({
      productId: product._id,
      productName: product.name,
      sku: baseSku,
      image: product.images?.[0] ?? "",
      category: product.category,
      stock,
      lowStockThreshold: 10,
      status: stockStatus,
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
        let newStatus: "in-stock" | "low-stock" | "out-of-stock";
        if (updates.stockCount === 0) newStatus = "out-of-stock";
        else if (updates.stockCount <= inv.lowStockThreshold)
          newStatus = "low-stock";
        else newStatus = "in-stock";

        await InventoryModel.updateOne(
          { productId: req.params.id },
          {
            $set: {
              stock: updates.stockCount,
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
