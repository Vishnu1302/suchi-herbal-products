import { Pipe, PipeTransform } from "@angular/core";

const BADGE_LABELS: Record<string, string> = {
  new: "New",
  sale: "Sale",
  bestseller: "Best Seller",
};

/** Converts a raw badge value like "bestseller" to its display label "Best Seller". */
@Pipe({ name: "badgeLabel", standalone: true })
export class BadgeLabelPipe implements PipeTransform {
  transform(badge: string | undefined | null): string {
    if (!badge) return "";
    return BADGE_LABELS[badge] ?? badge;
  }
}
