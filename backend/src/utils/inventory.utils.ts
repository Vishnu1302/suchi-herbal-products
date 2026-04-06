/**
 * Shared inventory helpers.
 *
 * Aurea uses a single pooled inventory per product.
 * Stock is NOT split per size — all size variants draw from the same pool.
 *
 * Field meanings:
 *   stock     — physical units owned (decremented only when payment is captured)
 *   reserved  — units held by pending orders (payment not yet received)
 *   available — stock - reserved → what the storefront actually sells against
 *
 * Lifecycle:
 *   NEW ORDER (payment pending)      → reserveInventory  : available ↓, reserved ↑
 *   PAYMENT CAPTURED                 → commitInventory   : stock ↓, reserved ↓
 *   PAYMENT FAILED / UNPAID CANCEL   → releaseInventory  : available ↑, reserved ↓
 *   PAID ORDER CANCELLED             → restockInventory  : stock ↑, available ↑
 */
import InventoryModel from "../models/inventory.model";

export interface InventoryLineItem {
  productId: string;
  quantity: number;
}

/**
 * Derive the stock status string from a stock count and low-stock threshold.
 * Single source of truth — used by product creation, inventory update, and
 * the products PUT route so the logic is never duplicated.
 */
export function deriveStockStatus(
  stock: number,
  lowStockThreshold: number,
): "in-stock" | "low-stock" | "out-of-stock" {
  if (stock === 0) return "out-of-stock";
  if (stock <= lowStockThreshold) return "low-stock";
  return "in-stock";
}

// ─────────────────────────────────────────────────────────────────────────────
// RESERVE  — called when a new order is created (payment pending)
//
// Atomically moves qty from available → reserved.
// Condition `available >= qty` prevents overselling under concurrent load.
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Returns the productIds that could NOT be reserved (insufficient available stock).
 * An empty array means all items were reserved successfully.
 */
export async function reserveInventory(
  items: InventoryLineItem[],
): Promise<string[]> {
  const results = await Promise.all(
    items.map(async (item) => {
      const result = await InventoryModel.updateOne(
        { productId: item.productId, available: { $gte: item.quantity } },
        {
          $inc: { reserved: item.quantity, available: -item.quantity },
          $set: { lastUpdated: new Date() },
        },
      );
      return result.modifiedCount === 0 ? item.productId : null;
    }),
  );
  return results.filter((id): id is string => id !== null);
}

// ─────────────────────────────────────────────────────────────────────────────
// COMMIT  — called when payment is captured / order confirmed
//
// Permanently deducts from physical stock and clears the reservation.
// available is unchanged (already decremented at reserve time).
// ─────────────────────────────────────────────────────────────────────────────
export async function commitInventory(
  items: InventoryLineItem[],
): Promise<void> {
  const ops = items.map((item) =>
    InventoryModel.updateOne(
      { productId: item.productId },
      {
        $inc: { stock: -item.quantity, reserved: -item.quantity },
        $set: { lastUpdated: new Date() },
      },
    ),
  );
  await Promise.all(ops);
}

// ─────────────────────────────────────────────────────────────────────────────
// RELEASE  — called when payment fails OR an unpaid order is cancelled
//
// Undoes the reservation: reserved → available again.
// Physical stock is never touched because payment never happened.
// ─────────────────────────────────────────────────────────────────────────────
export async function releaseInventory(
  items: InventoryLineItem[],
): Promise<void> {
  const ops = items.map((item) =>
    InventoryModel.updateOne(
      { productId: item.productId },
      {
        $inc: { reserved: -item.quantity, available: item.quantity },
        $set: { lastUpdated: new Date() },
      },
    ),
  );
  await Promise.all(ops);
}

// ─────────────────────────────────────────────────────────────────────────────
// RESTOCK  — called when a paid order is cancelled after payment
//
// Restores both physical stock and available.
// reserved was already cleared at commit time so we don't touch it.
// ─────────────────────────────────────────────────────────────────────────────
export async function restockInventory(
  items: InventoryLineItem[],
): Promise<void> {
  const ops = items.map((item) =>
    InventoryModel.updateOne(
      { productId: item.productId },
      {
        $inc: { stock: item.quantity, available: item.quantity },
        $set: { lastUpdated: new Date() },
      },
    ),
  );
  await Promise.all(ops);
}
