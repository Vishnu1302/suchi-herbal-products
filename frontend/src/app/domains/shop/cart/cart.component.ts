import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { CartService, type CartItem } from "./cart.service";

@Component({
  selector: "app-cart",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./cart.component.html",
  styleUrl: "./cart.component.scss",
})
export class CartComponent {
  cartSvc = inject(CartService);

  get cartItems(): CartItem[] {
    return this.cartSvc.cartItems();
  }

  /** Maximum orderable qty for an item (capped by product stock) */
  maxQty(item: CartItem): number {
    return item.product.stockCount ?? Infinity;
  }

  atStockLimit(item: CartItem): boolean {
    return item.quantity >= this.maxQty(item);
  }

  increment(item: CartItem) {
    if (this.atStockLimit(item)) return;
    this.cartSvc.updateQuantity(
      item.product.id,
      item.selectedSize,
      item.selectedColor,
      item.quantity + 1,
    );
  }

  decrement(item: CartItem) {
    this.cartSvc.updateQuantity(
      item.product.id,
      item.selectedSize,
      item.selectedColor,
      item.quantity - 1,
    );
  }

  remove(item: CartItem) {
    this.cartSvc.removeFromCart(
      item.product.id,
      item.selectedSize,
      item.selectedColor,
    );
  }
}
