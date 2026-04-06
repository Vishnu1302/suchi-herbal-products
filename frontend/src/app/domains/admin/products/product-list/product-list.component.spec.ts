import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { of } from "rxjs";
import { ProductListComponent } from "./product-list.component";
import { AdminProductService } from "../products.service";
import { MOCK_PRODUCTS } from "../../../../core/mocks/products.mock";

describe("ProductListComponent", () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let svcSpy: jasmine.SpyObj<AdminProductService>;

  beforeEach(async () => {
    svcSpy = jasmine.createSpyObj("AdminProductService", ["getAll", "delete"]);
    svcSpy.getAll.and.returnValue(of([...MOCK_PRODUCTS]));

    await TestBed.configureTestingModule({
      imports: [ProductListComponent, RouterTestingModule],
      providers: [{ provide: AdminProductService, useValue: svcSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => expect(component).toBeTruthy());

  it("should load and display products on init", () => {
    expect(svcSpy.getAll).toHaveBeenCalled();
    expect(component.products.length).toBe(MOCK_PRODUCTS.length);
  });

  it("trackById should return product id", () => {
    expect(component.trackById(0, MOCK_PRODUCTS[0])).toBe(MOCK_PRODUCTS[0].id);
  });

  it("getStockClass returns stock--none when stockCount is 0", () => {
    const p = { ...MOCK_PRODUCTS[0], stockCount: 0 };
    expect(component.getStockClass(p)).toBe("stock--none");
  });

  it("getStockClass returns stock--low when stockCount <= 10", () => {
    const p = { ...MOCK_PRODUCTS[0], stockCount: 8 };
    expect(component.getStockClass(p)).toBe("stock--low");
  });

  it("getStockClass returns stock--ok when stockCount > 10", () => {
    const p = { ...MOCK_PRODUCTS[0], stockCount: 50 };
    expect(component.getStockClass(p)).toBe("stock--ok");
  });

  it("deleteProduct should reload list after successful delete", () => {
    spyOn(window, "confirm").and.returnValue(true);
    svcSpy.delete = jasmine.createSpy().and.returnValue(of(undefined));
    const loadSpy = spyOn(component, "load").and.callThrough();

    component.deleteProduct("prod-001");
    expect(svcSpy.delete).toHaveBeenCalledWith("prod-001");
    expect(loadSpy).toHaveBeenCalled();
  });

  it("deleteProduct should NOT call delete when user cancels confirm", () => {
    spyOn(window, "confirm").and.returnValue(false);
    svcSpy.delete = jasmine.createSpy().and.returnValue(of(undefined));

    component.deleteProduct("prod-001");
    expect(svcSpy.delete).not.toHaveBeenCalled();
  });

  it("onSearch should call load()", () => {
    const loadSpy = spyOn(component, "load").and.callThrough();
    component.onSearch();
    expect(loadSpy).toHaveBeenCalled();
  });
});
