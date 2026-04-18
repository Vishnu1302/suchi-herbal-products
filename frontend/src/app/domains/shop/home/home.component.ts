import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterLink } from "@angular/router";
import { CATEGORIES } from "../../../core/models/category.model";

const PENDING_KEY = "aurea_pending_order";
const PENDING_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule, RouterLink],
  styleUrls: ["./home.component.scss"],
  templateUrl: "./home.component.html",
})
export class HomeComponent {
  // --- Payment banner logic ---
  private readonly router = inject(Router);
  pendingOrderNumber = signal<string | null>(null);

  // --- Carousel configuration ---
  // Now loads from assets/carousel/carousel-manifest.json
  carouselSlides: { file: string }[] = [];

  getCategorySlugFromFile(file: string): string | null {
    // e.g. oil.png → oil
    const base = file.split("/").pop()?.split(".")[0]?.toLowerCase() || "";
    return CATEGORIES.some((c) => c.slug === base) ? base : null;
  }

  onCarouselClick(file: string) {
    const filter = this.getCategorySlugFromFile(file);
    if (filter) {
      this.router.navigate(["/products"], {
        queryParams: { category: filter },
      });
    } else {
      this.router.navigate(["/products"]);
    }
  }

  currentSlide = 0;
  private autoSlideInterval: any;

  constructor() {
    this.checkPending();
    this.loadCarouselManifest();
  }

  private loadCarouselManifest() {
    fetch("assets/carousel/carousel-manifest.json")
      .then((res) => res.json())
      .then((files: string[]) => {
        this.carouselSlides = files.map((file) => ({ file }));
        this.startAutoSlide();
      });
  }

  // --- Payment banner methods ---
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

  // --- Carousel controls ---
  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.carouselSlides.length;
    this.restartAutoSlide();
  }

  prevSlide() {
    this.currentSlide =
      (this.currentSlide - 1 + this.carouselSlides.length) %
      this.carouselSlides.length;
    this.restartAutoSlide();
  }

  goToSlide(index: number) {
    this.currentSlide = index;
    this.restartAutoSlide();
  }

  startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 4000); // 4 seconds
  }

  restartAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
    this.startAutoSlide();
  }

  // --- End carousel logic ---
}
