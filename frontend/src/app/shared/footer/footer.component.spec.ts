import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let fixture: ComponentFixture<FooterComponent>;
  let component: FooterComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FooterComponent,      // standalone — imported directly
        RouterTestingModule,  // provides RouterLink
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── Creation ────────────────────────────────────────────────────────────

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // ── year property ───────────────────────────────────────────────────────

  it('should set year to the current calendar year', () => {
    expect(component.year).toBe(new Date().getFullYear());
  });

  it('should render the current year in the copyright notice', () => {
    const copyEl: HTMLElement = fixture.debugElement.query(
      By.css('.footer__copy'),
    ).nativeElement;

    expect(copyEl.textContent).toContain(String(new Date().getFullYear()));
  });

  // ── Brand section ───────────────────────────────────────────────────────

  it('should render the brand name "Suchi Kids Fashion"', () => {
    const brand: HTMLElement = fixture.debugElement.query(
      By.css('.footer__brand strong'),
    ).nativeElement;

    expect(brand.textContent).toContain('Suchi Kids Fashion');
  });

  it('should render the brand tagline', () => {
    const tagline: HTMLElement = fixture.debugElement.query(
      By.css('.footer__brand p'),
    ).nativeElement;

    expect(tagline.textContent).toContain('Trendy');
  });

  it('should render the brand emoji icon', () => {
    const icon: HTMLElement = fixture.debugElement.query(
      By.css('.footer__brand span'),
    ).nativeElement;

    expect(icon.textContent).toContain('👗');
  });

  // ── Navigation links ────────────────────────────────────────────────────

  it('should render 4 navigation links', () => {
    const links = fixture.debugElement.queryAll(By.css('.footer__links a'));
    expect(links.length).toBe(4);
  });

  it('should have a Home link pointing to "/"', () => {
    const links = fixture.debugElement.queryAll(By.css('.footer__links a'));
    const home = links.find(
      (l) => l.nativeElement.textContent.trim() === 'Home',
    );
    expect(home).toBeTruthy();
    // RouterLink sets href after navigation in RouterTestingModule
    expect(home!.attributes['routerLink']).toBe('/');
  });

  it('should have a Shop link pointing to "/products"', () => {
    const links = fixture.debugElement.queryAll(By.css('.footer__links a'));
    const shop = links.find(
      (l) => l.nativeElement.textContent.trim() === 'Shop',
    );
    expect(shop).toBeTruthy();
    expect(shop!.attributes['routerLink']).toBe('/products');
  });

  it('should have a Cart link pointing to "/cart"', () => {
    const links = fixture.debugElement.queryAll(By.css('.footer__links a'));
    const cart = links.find(
      (l) => l.nativeElement.textContent.trim() === 'Cart',
    );
    expect(cart).toBeTruthy();
    expect(cart!.attributes['routerLink']).toBe('/cart');
  });

  it('should have an Admin link pointing to "/admin"', () => {
    const links = fixture.debugElement.queryAll(By.css('.footer__links a'));
    const admin = links.find(
      (l) => l.nativeElement.textContent.trim() === 'Admin',
    );
    expect(admin).toBeTruthy();
    expect(admin!.attributes['routerLink']).toBe('/admin');
  });

  // ── Copyright copy ──────────────────────────────────────────────────────

  it('should render "All rights reserved." in the copyright section', () => {
    const copyEl: HTMLElement = fixture.debugElement.query(
      By.css('.footer__copy'),
    ).nativeElement;

    expect(copyEl.textContent).toContain('All rights reserved.');
  });

  // ── DOM structure ───────────────────────────────────────────────────────

  it('should render a <footer> element', () => {
    const footer = fixture.debugElement.query(By.css('footer'));
    expect(footer).toBeTruthy();
  });

  it('should apply the "footer" CSS class to the root element', () => {
    const footer: HTMLElement = fixture.debugElement.query(
      By.css('footer'),
    ).nativeElement;

    expect(footer.classList).toContain('footer');
  });
});
