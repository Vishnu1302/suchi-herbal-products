import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { NotFoundComponent } from "./not-found.component";

describe("NotFoundComponent", () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => expect(component).toBeTruthy());

  it("should render a link back to home", () => {
    const compiled: HTMLElement = fixture.nativeElement;
    const links = compiled.querySelectorAll("a[routerLink], a[href]");
    const hasHomeLink = Array.from(links).some(
      (l) =>
        l.getAttribute("routerLink") === "/" || l.getAttribute("href") === "/",
    );
    expect(hasHomeLink).toBeTrue();
  });
});
