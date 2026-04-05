import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterLink } from "@angular/router";

const PENDING_KEY = "aurea_pending_order";
const PENDING_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule, RouterLink],
  styleUrl: "./home.component.scss",
  templateUrl: "./home.component.html",
})
export class HomeComponent {
  private readonly router = inject(Router);

  // Initialised in constructor so the signal value is known before the first
  // template render — prevents the banner from being inserted post-paint
  // which would force a synchronous reflow.
  pendingOrderNumber = signal<string | null>(null);

  constructor() {
    this.checkPending();
  }

  private checkPending() {
    try {
      const raw = localStorage.getItem(PENDING_KEY);
      if (!raw) return;
      const pending = JSON.parse(raw) as {
        orderNumber?: string;
        savedAt?: number;
      };
      const savedAt = pending.savedAt ?? 0;
      if (Date.now() - savedAt < PENDING_EXPIRY_MS) {
        this.pendingOrderNumber.set(pending.orderNumber ?? "");
      } else {
        // Expired — clean up silently
        localStorage.removeItem(PENDING_KEY);
      }
    } catch {
      localStorage.removeItem(PENDING_KEY);
    }
  }

  resumePayment() {
    this.router.navigate(["/checkout"]);
  }

  dismissPending() {
    localStorage.removeItem(PENDING_KEY);
    this.pendingOrderNumber.set(null);
  }
}
