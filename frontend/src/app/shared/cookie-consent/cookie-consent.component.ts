import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-cookie-consent",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./cookie-consent.component.html",
  styleUrl: "./cookie-consent.component.scss",
})
export class CookieConsentComponent implements OnInit {
  visible = signal(false);

  ngOnInit() {
    if (!localStorage.getItem("suchi_cookie_consent")) {
      // Slight delay so the page loads before the banner appears
      setTimeout(() => this.visible.set(true), 900);
    }
  }

  accept() {
    localStorage.setItem("suchi_cookie_consent", "accepted");
    this.visible.set(false);
  }

  decline() {
    localStorage.setItem("suchi_cookie_consent", "essential_only");
    this.visible.set(false);
  }
}
