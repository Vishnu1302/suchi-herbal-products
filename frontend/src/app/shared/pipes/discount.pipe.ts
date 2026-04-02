import { Pipe, PipeTransform } from "@angular/core";

/**
 * Calculates the percentage discount between a sale price and an original price.
 * Usage in template:  {{ product.price | discount:product.originalPrice }}% off
 */
@Pipe({ name: "discount", standalone: true })
export class DiscountPipe implements PipeTransform {
  transform(price: number, originalPrice: number | undefined | null): number {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  }
}
