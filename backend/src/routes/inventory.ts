import { Router } from "express";
import mongoose from "mongoose";
import InventoryModel from "../models/inventory.model";
import ProductModel from "../models/product.model";

const router = Router();

// GET /api/inventory - list all inventory items
router.get("/", async (_req, res) => {
  try {
    const items = await InventoryModel.find().lean();
    res.json(items);
  } catch (err) {
    console.error("Error fetching inventory", err);
    res.status(500).json({ message: "Failed to fetch inventory" });
  }
});

// GET /api/inventory/:productId - inventory for a specific product
router.get("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }
    const item = await InventoryModel.findOne({ productId }).lean();
    if (!item) return res.status(404).json({ message: "Inventory not found" });
    res.json(item);
  } catch (err) {
    console.error("Error fetching inventory item", err);
    res.status(500).json({ message: "Failed to fetch inventory item" });
  }
});

// POST /api/inventory/update-stock - update stock for a single variant and sync product
router.post("/update-stock", async (req, res) => {
  try {
    const { productId, variantSku, newStock } = req.body as {
      productId: string;
      variantSku: string;
      newStock: number;
      reason?: string;
    };

    if (!productId || typeof productId !== "string") {
      return res.status(400).json({ message: 'Field "productId" is required' });
    }

    if (!variantSku || typeof variantSku !== "string") {
      return res
        .status(400)
        .json({ message: 'Field "variantSku" is required' });
    }

    if (
      typeof newStock !== "number" ||
      Number.isNaN(newStock) ||
      newStock < 0
    ) {
      return res
        .status(400)
        .json({ message: 'Field "newStock" must be a non-negative number' });
    }

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }

    const item = await InventoryModel.findOne({ productId });
    if (!item) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    const variant = item.variants.find((v) => v.sku === variantSku);
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    if (newStock < variant.reserved) {
      return res.status(400).json({
        message: "New stock cannot be less than reserved quantity",
      });
    }

    variant.stock = newStock;
    variant.available = Math.max(0, newStock - variant.reserved);

    item.totalStock = item.variants.reduce((sum, v) => sum + v.stock, 0);
    item.status =
      item.totalStock === 0
        ? "out-of-stock"
        : item.totalStock <= item.lowStockThreshold
          ? "low-stock"
          : "in-stock";
    item.lastUpdated = new Date();

    await item.save();

    // Keep product.stockCount and inStock in sync with inventory
    await ProductModel.findByIdAndUpdate(productId, {
      stockCount: item.totalStock,
      inStock: item.totalStock > 0,
    });

    res.json(item.toObject());
  } catch (err) {
    console.error("Error updating stock", err);
    res.status(500).json({ message: "Failed to update stock" });
  }
});

export default router;
