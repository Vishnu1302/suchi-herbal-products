/**
 * Shared inventory helpers.
 *
 * Suchi Kids uses a single pooled inventory variant per product (variants[0]).
 * Stock is NOT split per clothing size — stockCount is a total pool.
 * The selected size is stored on the order for fulfilment only.
 *
 * Field meanings:
 *   stock     — physical units owned (decremented only when payment is captured)
 *   reserved  — units held by pending/confirmed-but-not-yet-shipped orders
 *   available — stock - reserved  → what the storefront actually sells against
 */
import InventoryModel from "../models/inventory.model";

export interface InventoryLineItem {
  productId: string;
  size: string; // kept for order reference, not used for inventory lookup
  quantity: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// RESERVE  — called when a new order is created (payment pending)
//
// Moves qty from available → reserved for the matching size variant.
// $elemMatch ensures we only reserve when that size has available >= qty,
// preventing overselling under concurrent requests.
// ─────────────────────────────────────────────────────────────────────────────
export async function reserveInventory(
  items: InventoryLineItem[],
): Promise<void> {
  const ops = items.map((item) =>
    InventoryModel.updateOne(
      {
        productId: item.productId,
        variants: {
          $elemMatch: { size: item.size, available: { $gte: item.quantity } },
        },
      },
      {
        $inc: {
          "variants.$.reserved": item.quantity,
          "variants.$.available": -item.quantity,
        },
        $set: { lastUpdated: new Date() },
      },
    ),
  );
  await Promise.all(ops);
}

// ─────────────────────────────────────────────────────────────────────────────
// COMMIT  — called when payment is captured / order confirmed
//
// Permanently deducts from physical stock and clears the reservation for
// the matching size variant. available stays the same (already decremented).
// ─────────────────────────────────────────────────────────────────────────────
export async function commitInventory(
  items: InventoryLineItem[],
): Promise<void> {
  const ops = items.map((item) =>
    InventoryModel.updateOne(
      {
        productId: item.productId,
        "variants.size": item.size,
      },
      {
        $inc: {
          "variants.$.stock": -item.quantity,
          "variants.$.reserved": -item.quantity,
          totalStock: -item.quantity,
        },
        $set: { lastUpdated: new Date() },
      },
    ),
  );
  await Promise.all(ops);
}

// ─────────────────────────────────────────────────────────────────────────────
// RELEASE  — called when payment fails OR unpaid order is cancelled
//
// Undoes the reservation for the matching size: reserved → available.
// Physical stock is never touched because payment never happened.
// ─────────────────────────────────────────────────────────────────────────────
export async function releaseInventory(
  items: InventoryLineItem[],
): Promise<void> {
  const ops = items.map((item) =>
    InventoryModel.updateOne(
      {
        productId: item.productId,
        "variants.size": item.size,
      },
      {
        $inc: {
          "variants.$.reserved": -item.quantity,
          "variants.$.available": item.quantity,
        },
        $set: { lastUpdated: new Date() },
      },
    ),
  );
  await Promise.all(ops);
}

// ─────────────────────────────────────────────────────────────────────────────
// RESTOCK  — called when a paid order is cancelled after payment
//
// Restores both physical stock and available for the matching size.
// reserved was already cleared at commit time.
// ─────────────────────────────────────────────────────────────────────────────
export async function restockInventory(
  items: InventoryLineItem[],
): Promise<void> {
  const ops = items.map((item) =>
    InventoryModel.updateOne(
      {
        productId: item.productId,
        "variants.size": item.size,
      },
      {
        $inc: {
          "variants.$.stock": item.quantity,
          "variants.$.available": item.quantity,
          totalStock: item.quantity,
        },
        $set: { lastUpdated: new Date() },
      },
    ),
  );
  await Promise.all(ops);
}
