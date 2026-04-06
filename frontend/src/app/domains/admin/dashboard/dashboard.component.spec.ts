import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { of } from "rxjs";
import { DashboardComponent } from "./dashboard.component";
import { AdminProductService } from "../products/products.service";
import { AdminOrdersService } from "../orders/orders.service";
import { AdminInventoryService } from "../inventory/inventory.service";

describe("DashboardComponent", () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  const mockProductStats = { total: 8, inStock: 6, outOfStock: 1, lowStock: 1 };
  const mockOrderStats = {
    total: 5,
    pending: 1,
    processing: 1,
    shipped: 1,
    delivered: 1,
    cancelled: 1,
    totalRevenue: 3000,
  };
  const mockInventoryStats = {
    total: 8,
    inStock: 5,
    lowStock: 2,
    outOfStock: 1,
  };

  let productSvcSpy: jasmine.SpyObj<AdminProductService>;
  let orderSvcSpy: jasmine.SpyObj<AdminOrdersService>;
  let inventorySvcSpy: jasmine.SpyObj<AdminInventoryService>;

  beforeEach(async () => {
    productSvcSpy = jasmine.createSpyObj("AdminProductService", ["getStats"]);
    productSvcSpy.getStats.and.returnValue(mockProductStats);

    orderSvcSpy = jasmine.createSpyObj("AdminOrdersService", ["getStats"]);
    orderSvcSpy.getStats.and.returnValue(of(mockOrderStats));

    inventorySvcSpy = jasmine.createSpyObj("AdminInventoryService", [
      "getStats",
    ]);
    inventorySvcSpy.getStats.and.returnValue(mockInventoryStats);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, RouterTestingModule],
      providers: [
        { provide: AdminProductService, useValue: productSvcSpy },
        { provide: AdminOrdersService, useValue: orderSvcSpy },
        { provide: AdminInventoryService, useValue: inventorySvcSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => expect(component).toBeTruthy());

  it("should load product stats on init", () => {
    expect(component.productStats.total).toBe(8);
    expect(component.productStats.inStock).toBe(6);
  });

  it("should load order stats on init", () => {
    expect(component.orderStats.total).toBe(5);
    expect(component.orderStats.totalRevenue).toBe(3000);
  });

  it("should load inventory stats on init", () => {
    expect(component.inventoryStats.lowStock).toBe(2);
  });
});
