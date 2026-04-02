import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { CartService, type CartItem } from "./cart.service";

@Component({
  selector: "app-cart",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="cart-page container">
      <h1><i class="fa-solid fa-cart-shopping"></i> Your Cart</h1>

      <div class="cart__layout" *ngIf="cartItems.length > 0; else emptyCart">
        <!-- Items -->
        <div class="cart__items">
          <div class="cart-item card" *ngFor="let item of cartItems">
            <img
              [src]="item.product.images[0]"
              [alt]="item.product.name"
              class="cart-item__img"
            />
            <div class="cart-item__info">
              <h4>{{ item.product.name }}</h4>
              <!-- No size for herbal products -->
              <p class="cart-item__price">₹{{ item.product.price }}</p>
            </div>
            <div class="cart-item__qty">
              <button (click)="decrement(item)">−</button>
              <span>{{ item.quantity }}</span>
              <button (click)="increment(item)">+</button>
            </div>
            <div class="cart-item__subtotal">
              ₹{{ item.product.price * item.quantity }}
            </div>
            <button
              class="cart-item__remove"
              (click)="remove(item)"
              title="Remove"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Summary -->
        <div class="cart__summary card">
          <h3>Order Summary</h3>
          <div class="summary-row">
            <span>Subtotal ({{ cartSvc.cartCount() }} items)</span>
            <span>₹{{ cartSvc.cartTotal() }}</span>
          </div>
          <div class="summary-row">
            <span>Shipping</span>
            <span class="free">FREE</span>
          </div>
          <div class="summary-row total">
            <span>Total</span>
            <span>₹{{ cartSvc.cartTotal() }}</span>
          </div>
          <button class="btn btn--primary btn--full" routerLink="/checkout">
            Proceed to Checkout →
          </button>
          <a routerLink="/products" class="continue-link"
            >← Continue Shopping</a
          >
        </div>
      </div>

      <ng-template #emptyCart>
        <div class="empty-cart">
          <span>🛍️</span>
          <h3>Your cart is empty!</h3>
          <p>Looks like you haven't added anything yet.</p>
          <a routerLink="/products" class="btn btn--primary">Start Shopping</a>
        </div>
      </ng-template>
    </div>
  `,
  styleUrl: "./cart.component.scss",
})
export class CartComponent {
  cartSvc = inject(CartService);

  get cartItems(): CartItem[] {
    return this.cartSvc.cartItems();
  }

  increment(item: CartItem) {
    this.cartSvc.updateQuantity(item.product.id, "", "", item.quantity + 1);
  }

  decrement(item: CartItem) {
    this.cartSvc.updateQuantity(item.product.id, "", "", item.quantity - 1);
  }

  remove(item: CartItem) {
    this.cartSvc.removeFromCart(item.product.id, "", "");
  }
}
