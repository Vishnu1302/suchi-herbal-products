import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { Router } from "@angular/router";
import { HomeComponent } from "./home.component";

const PENDING_KEY = "aurea_pending_order";

describe("HomeComponent", () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [HomeComponent, RouterTestingModule],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, "navigate");
  });

  afterEach(() => localStorage.clear());

  function createComponent() {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it("should create", () => {
    createComponent();
    expect(component).toBeTruthy();
  });

  it("should have no pending order signal by default", () => {
    createComponent();
    expect(component.pendingOrderNumber()).toBeNull();
  });

  it("should detect a valid non-expired pending order on init", () => {
    localStorage.setItem(
      PENDING_KEY,
      JSON.stringify({ orderNumber: "SHB-001", savedAt: Date.now() }),
    );
    createComponent();
    expect(component.pendingOrderNumber()).toBe("SHB-001");
  });

  it("should ignore and remove an expired pending order", () => {
    const EXPIRED_AT = Date.now() - 11 * 60 * 1000;
    localStorage.setItem(
      PENDING_KEY,
      JSON.stringify({ orderNumber: "SHB-001", savedAt: EXPIRED_AT }),
    );
    createComponent();
    expect(component.pendingOrderNumber()).toBeNull();
    expect(localStorage.getItem(PENDING_KEY)).toBeNull();
  });

  it("should handle malformed localStorage without throwing", () => {
    localStorage.setItem(PENDING_KEY, "{{broken json");
    expect(() => createComponent()).not.toThrow();
    expect(component.pendingOrderNumber()).toBeNull();
  });

  it("resumePayment() should navigate to /checkout", () => {
    createComponent();
    component.resumePayment();
    expect(router.navigate).toHaveBeenCalledWith(["/checkout"]);
  });

  it("dismissPending() should clear signal and remove from localStorage", () => {
    localStorage.setItem(
      PENDING_KEY,
      JSON.stringify({ orderNumber: "SHB-001", savedAt: Date.now() }),
    );
    createComponent();
    expect(component.pendingOrderNumber()).not.toBeNull();

    component.dismissPending();
    expect(component.pendingOrderNumber()).toBeNull();
    expect(localStorage.getItem(PENDING_KEY)).toBeNull();
  });
});
