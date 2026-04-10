import { Component, OnInit, signal, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-cookie-consent",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./cookie-consent.component.html",
  styleUrl: "./cookie-consent.component.scss",
})
export class CookieConsentComponent implements OnInit {
  visible = signal(false);
  auth = inject(AuthService);

  ngOnInit() {
    // Show consent only if user is logged in and hasn't already accepted/declined
    if (this.auth.isLoggedIn && !localStorage.getItem("aurea_cookie_consent")) {
      setTimeout(() => this.visible.set(true), 900);
    }
  }

  accept() {
    localStorage.setItem("aurea_cookie_consent", "accepted");
    this.visible.set(false);
  }

  decline() {
    localStorage.setItem("aurea_cookie_consent", "essential_only");
    this.visible.set(false);
  }
}
