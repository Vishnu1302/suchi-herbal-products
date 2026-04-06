import { Injectable, signal, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of, delay, map, tap } from "rxjs";
import {
  InventoryItem,
  StockUpdatePayload,
} from "../../../core/models/inventory.model";
import { MOCK_INVENTORY } from "../../../core/mocks/inventory.mock";
import { environment } from "../../../../environments/environment";

@Injectable({ providedIn: "root" })
export class AdminInventoryService {
  private http = inject(HttpClient);
  private readonly inventory = signal<InventoryItem[]>(
    environment.useMockData ? [...MOCK_INVENTORY] : [],
  );
  private readonly baseUrl = `${environment.apiUrl}/inventory`;

  getAll(): Observable<InventoryItem[]> {
    if (environment.useMockData) {
      return of([...this.inventory()]).pipe(delay(300));
    }

    return this.http
      .get<InventoryItem[]>(this.baseUrl)
      .pipe(tap((items) => this.inventory.set(items)));
  }

  getByProductId(productId: string): Observable<InventoryItem | undefined> {
    if (environment.useMockData) {
      return of(
        this.inventory().find((i: InventoryItem) => i.productId === productId),
      ).pipe(delay(200));
    }

    return this.http
      .get<InventoryItem>(`${this.baseUrl}/${productId}`)
      .pipe(map((item) => item as InventoryItem));
  }

  updateStock(payload: StockUpdatePayload): Observable<InventoryItem> {
    if (environment.useMockData) {
      let updated!: InventoryItem;
      this.inventory.update((list) =>
        list.map((item: InventoryItem) => {
          if (item.productId === payload.productId) {
            updated = {
              ...item,
              stock: payload.newStock,
              status:
                payload.newStock === 0
                  ? "out-of-stock"
                  : payload.newStock <= item.lowStockThreshold
                    ? "low-stock"
                    : "in-stock",
              lastUpdated: new Date(),
            };
            return updated;
          }
          return item;
        }),
      );
      return of(updated).pipe(delay(400));
    }

    return this.http
      .post<InventoryItem>(`${this.baseUrl}/update-stock`, payload)
      .pipe(
        tap((updated) =>
          this.inventory.update((list: InventoryItem[]) =>
            list.map((item) =>
              item.productId === updated.productId ? updated : item,
            ),
          ),
        ),
      );
  }

  getStats() {
    const all = this.inventory();
    return {
      total: all.length,
      inStock: all.filter((i: InventoryItem) => i.status === "in-stock").length,
      lowStock: all.filter((i: InventoryItem) => i.status === "low-stock")
        .length,
      outOfStock: all.filter((i: InventoryItem) => i.status === "out-of-stock")
        .length,
    };
  }
}
