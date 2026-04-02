import { Injectable, signal, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of, delay, throwError, map, tap } from "rxjs";
import { Product, ProductFilter } from "../../../core/models/product.model";
import { MOCK_PRODUCTS } from "../../../core/mocks/products.mock";
import { environment } from "../../../../environments/environment";

@Injectable({ providedIn: "root" })
export class AdminProductService {
  private readonly http = inject(HttpClient);
  private readonly products = signal<Product[]>(
    environment.useMockData ? [...MOCK_PRODUCTS] : [],
  );
  private readonly baseUrl = `${environment.apiUrl}/products`;

  private fromBackend(doc: any): Product {
    const { _id, ...rest } = doc;
    return { ...(rest as Product), id: _id };
  }

  private applyFilter(list: Product[], filter?: ProductFilter): Product[] {
    if (!filter) return list;
    let result = [...list];

    if (filter.category) {
      result = result.filter((p: Product) => p.category === filter.category);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (p: Product) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }

    return result;
  }

  getAll(filter?: ProductFilter): Observable<Product[]> {
    if (environment.useMockData) {
      let result = [...this.products()];
      return of(this.applyFilter(result, filter)).pipe(delay(300));
    }

    return this.http.get<any[]>(this.baseUrl).pipe(
      map((docs) => docs.map((d) => this.fromBackend(d))),
      tap((list) => this.products.set(list)),
      map((list) => this.applyFilter(list, filter)),
    );
  }

  getById(id: string): Observable<Product | undefined> {
    if (environment.useMockData) {
      return of(this.products().find((p: Product) => p.id === id)).pipe(
        delay(200),
      );
    }

    return this.http
      .get<any>(`${this.baseUrl}/${id}`)
      .pipe(map((doc) => (doc ? this.fromBackend(doc) : undefined)));
  }

  create(product: Omit<Product, "id">): Observable<Product> {
    if (environment.useMockData) {
      const newProduct: Product = {
        ...product,
        id: `prod-${Date.now()}`,
      } as Product;
      this.products.update((list) => [...list, newProduct]);
      return of(newProduct).pipe(delay(400));
    }

    return this.http.post<any>(this.baseUrl, product).pipe(
      map((doc) => this.fromBackend(doc)),
      tap((created) =>
        this.products.update((list: Product[]) => [...list, created]),
      ),
    );
  }

  update(id: string, changes: Partial<Product>): Observable<Product> {
    if (environment.useMockData) {
      let updated!: Product;
      this.products.update((list: Product[]) =>
        list.map((p: Product) => {
          if (p.id === id) {
            updated = { ...p, ...changes };
            return updated;
          }
          return p;
        }),
      );
      return updated
        ? of(updated).pipe(delay(400))
        : throwError(() => new Error("Product not found"));
    }

    return this.http.put<any>(`${this.baseUrl}/${id}`, changes).pipe(
      map((doc) => this.fromBackend(doc)),
      tap((updated) =>
        this.products.update((list: Product[]) =>
          list.map((p: Product) => (p.id === id ? updated : p)),
        ),
      ),
    );
  }

  delete(id: string): Observable<void> {
    if (environment.useMockData) {
      this.products.update((list: Product[]) =>
        list.filter((p: Product) => p.id !== id),
      );
      return of(undefined).pipe(delay(300));
    }

    return this.http
      .delete<void>(`${this.baseUrl}/${id}`)
      .pipe(
        tap(() =>
          this.products.update((list: Product[]) =>
            list.filter((p: Product) => p.id !== id),
          ),
        ),
      );
  }

  getStats() {
    const all = this.products();
    return {
      total: all.length,
      inStock: all.filter((p: Product) => p.inStock && p.stockCount > 0).length,
      outOfStock: all.filter((p: Product) => !p.inStock || p.stockCount === 0)
        .length,
      lowStock: all.filter(
        (p: Product) => p.stockCount > 0 && p.stockCount <= 10,
      ).length,
    };
  }
}
