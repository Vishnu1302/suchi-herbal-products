import { Router, type Request, type Response } from "express";
import mongoose from "mongoose";
import InventoryModel from "../models/inventory.model";
import ProductModel from "../models/product.model";
import { requireAdmin } from "../middleware/adminAuth";
import { deriveStockStatus } from "../utils/inventory.utils";

const router = Router();

// GET /api/inventory - list all inventory items (admin only)
router.get("/", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const items = await InventoryModel.find().lean();
    res.json(items);
  } catch (err) {
    console.error("Error fetching inventory", err);
    res.status(500).json({ message: "Failed to fetch inventory" });
  }
});

// GET /api/inventory/:productId - inventory for a specific product (admin only)
router.get("/:productId", requireAdmin, async (req: Request, res: Response) => {
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

// POST /api/inventory/update-stock - update stock for a product and sync product (admin only)
router.post(
  "/update-stock",
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { productId, newStock } = req.body as {
        productId: string;
        newStock: number;
        reason?: string;
      };

      if (!productId || typeof productId !== "string") {
        return res
          .status(400)
          .json({ message: 'Field "productId" is required' });
      }

      if (
        typeof newStock !== "number" ||
        Number.isNaN(newStock) ||
        newStock < 0
      ) {
        return res
          .status(400)
          .json({ message: '"newStock" must be a non-negative number' });
      }

      if (!mongoose.isValidObjectId(productId)) {
        return res.status(400).json({ message: "Invalid productId" });
      }

      const item = await InventoryModel.findOne({ productId });
      if (!item) {
        return res.status(404).json({ message: "Inventory not found" });
      }

      item.stock = newStock;
      item.available = Math.max(0, newStock - item.reserved);
      item.status = deriveStockStatus(newStock, item.lowStockThreshold);
      item.lastUpdated = new Date();

      await item.save();

      // Keep product.stockCount and inStock in sync
      await ProductModel.findByIdAndUpdate(productId, {
        stockCount: newStock,
        inStock: newStock > 0,
      });

      res.json(item.toObject());
    } catch (err) {
      console.error("Error updating stock", err);
      res.status(500).json({ message: "Failed to update stock" });
    }
  },
);

export default router;
