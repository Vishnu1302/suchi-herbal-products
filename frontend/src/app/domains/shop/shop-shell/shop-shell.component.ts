import { Component, inject } from "@angular/core";
import { RouterOutlet, RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import { CartService } from "../cart/cart.service";
import { AuthService } from "../../../core/services/auth.service";
import { CookieConsentComponent } from "../../../shared/cookie-consent/cookie-consent.component";

@Component({
  selector: "app-shop-shell",
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, CookieConsentComponent],
  templateUrl: "./shop-shell.component.html",
  styleUrls: ["./shop-shell.component.scss"],
})
export class ShopShellComponent {
  cartSvc = inject(CartService);
  authSvc = inject(AuthService);

  menuOpen = false;

  resendSent = false;

  constructor() {
    // Close mobile nav when the user scrolls (prevents visual disconnect on iOS)
    window.addEventListener(
      "scroll",
      () => {
        if (this.menuOpen) this.menuOpen = false;
      },
      { passive: true },
    );
  }

  async resendVerification() {
    await this.authSvc.resendVerificationEmail();
    this.resendSent = true;
    setTimeout(() => (this.resendSent = false), 5000);
  }
}
