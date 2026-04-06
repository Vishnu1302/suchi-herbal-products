import { Injectable, signal, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of, delay, map, tap } from "rxjs";
import { Order, OrderStatus } from "../../../core/models/order.model";
import { MOCK_ORDERS } from "../../../core/mocks/orders.mock";
import { environment } from "../../../../environments/environment";

@Injectable({ providedIn: "root" })
export class AdminOrdersService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/orders`;

  // Local cache so the admin list doesn't refetch on every navigation
  private readonly orders = signal<Order[]>(
    environment.useMockData ? [...MOCK_ORDERS] : [],
  );

  /** Map a Mongo document (_id) to our frontend Order shape (id) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private fromBackend(doc: any): Order {
    const { _id, __v, ...rest } = doc;
    return { ...rest, id: String(_id) } as Order;
  }

  getAll(): Observable<Order[]> {
    if (environment.useMockData) {
      return of(
        [...this.orders()].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      ).pipe(delay(300));
    }

    return this.http.get<unknown[]>(this.baseUrl).pipe(
      map((docs) => docs.map((d) => this.fromBackend(d))),
      tap((list) => this.orders.set(list)),
    );
  }

  getById(id: string): Observable<Order | undefined> {
    if (environment.useMockData) {
      return of(this.orders().find((o) => o.id === id)).pipe(delay(200));
    }

    return this.http
      .get<unknown>(`${this.baseUrl}/${id}`)
      .pipe(map((doc) => this.fromBackend(doc)));
  }

  updateStatus(id: string, status: OrderStatus): Observable<Order> {
    if (environment.useMockData) {
      let updated!: Order;
      this.orders.update((list) =>
        list.map((o) => {
          if (o.id === id) {
            updated = { ...o, status, updatedAt: new Date() };
            return updated;
          }
          return o;
        }),
      );
      return of(updated).pipe(delay(400));
    }

    return this.http
      .patch<unknown>(`${this.baseUrl}/${id}/status`, { status })
      .pipe(
        map((doc) => this.fromBackend(doc)),
        tap((updated) =>
          this.orders.update((list) =>
            list.map((o) => (o.id === id ? updated : o)),
          ),
        ),
      );
  }

  getStats(): Observable<{
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    totalRevenue: number;
  }> {
    if (environment.useMockData) {
      const all = this.orders();
      const revenue = all
        .filter((o) => o.paymentStatus === "paid")
        .reduce((sum, o) => sum + o.total, 0);
      return of({
        total: all.length,
        pending: all.filter((o) => o.status === "pending").length,
        processing: all.filter((o) => o.status === "processing").length,
        shipped: all.filter((o) => o.status === "shipped").length,
        delivered: all.filter((o) => o.status === "delivered").length,
        cancelled: all.filter((o) => o.status === "cancelled").length,
        totalRevenue: revenue,
      }).pipe(delay(200));
    }

    return this.http.get<{
      total: number;
      pending: number;
      processing: number;
      shipped: number;
      delivered: number;
      cancelled: number;
      totalRevenue: number;
    }>(`${this.baseUrl}/stats`);
  }
}
