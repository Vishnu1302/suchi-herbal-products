import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule, FormBuilder } from "@angular/forms";
import { CatalogFilterPopupComponent } from "./catalog-filter-popup.component";
import { CATEGORIES } from "../../core/models/category.model";

describe("CatalogFilterPopupComponent", () => {
  let component: CatalogFilterPopupComponent;
  let fixture: ComponentFixture<CatalogFilterPopupComponent>;

  beforeEach(async () => {
    const fb = new FormBuilder();

    await TestBed.configureTestingModule({
      imports: [CatalogFilterPopupComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogFilterPopupComponent);
    component = fixture.componentInstance;

    // Provide required inputs
    component.categories = CATEGORIES;
    component.filterForm = fb.group({ category: [""], sortBy: ["newest"] });
    fixture.detectChanges();
  });

  it("should create", () => expect(component).toBeTruthy());

  it("should start closed", () => {
    expect(component.isOpen()).toBeFalse();
  });

  it("toggle() should open when closed", () => {
    component.toggle();
    expect(component.isOpen()).toBeTrue();
  });

  it("toggle() should close when open", () => {
    component.toggle();
    component.toggle();
    expect(component.isOpen()).toBeFalse();
  });

  it("close() should set isOpen to false", () => {
    component.toggle(); // open it
    component.close();
    expect(component.isOpen()).toBeFalse();
  });

  it("onClear() should emit cleared and close", () => {
    spyOn(component.cleared, "emit");
    component.toggle();
    component.onClear();
    expect(component.cleared.emit).toHaveBeenCalled();
    expect(component.isOpen()).toBeFalse();
  });

  it("onApply() should close the popup", () => {
    component.toggle();
    component.onApply();
    expect(component.isOpen()).toBeFalse();
  });

  it("onEsc() should close the popup", () => {
    component.toggle();
    component.onEsc();
    expect(component.isOpen()).toBeFalse();
  });
});
