import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { CookieConsentComponent } from "./cookie-consent.component";

describe("CookieConsentComponent", () => {
  let component: CookieConsentComponent;
  let fixture: ComponentFixture<CookieConsentComponent>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [CookieConsentComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CookieConsentComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => localStorage.clear());

  it("should create", () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it("should NOT show banner immediately when consent already given", fakeAsync(() => {
    localStorage.setItem("aurea_cookie_consent", "accepted");
    fixture.detectChanges();
    component.ngOnInit();
    tick(1000);
    expect(component.visible()).toBeFalse();
  }));

  it("should show banner after 900ms delay when no consent stored", fakeAsync(() => {
    fixture.detectChanges();
    component.ngOnInit();
    expect(component.visible()).toBeFalse();
    tick(900);
    expect(component.visible()).toBeTrue();
  }));

  it("accept() should hide banner and store accepted consent", fakeAsync(() => {
    fixture.detectChanges();
    component.ngOnInit();
    tick(900);
    component.accept();
    expect(component.visible()).toBeFalse();
    expect(localStorage.getItem("aurea_cookie_consent")).toBe("accepted");
  }));

  it("decline() should hide banner and store essential_only consent", fakeAsync(() => {
    fixture.detectChanges();
    component.ngOnInit();
    tick(900);
    component.decline();
    expect(component.visible()).toBeFalse();
    expect(localStorage.getItem("aurea_cookie_consent")).toBe("essential_only");
  }));
});
