import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { PaymentService } from "../../../core/services/payment.service";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-order-success",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./order-success.component.html",
  styleUrl: "./order-success.component.scss",
})
export class OrderSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private paymentSvc = inject(PaymentService);
  private authSvc = inject(AuthService);

  loading = signal(true);
  order = signal<Record<string, any> | null>(null);
  error = signal("");

  async ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get("orderId") ?? "";
    if (!orderId) {
      this.error.set("Invalid order link.");
      this.loading.set(false);
      return;
    }
    try {
      const uid = this.authSvc.currentUser()?.uid;
      const data = await firstValueFrom(this.paymentSvc.getOrder(orderId, uid));
      this.order.set(data as Record<string, any>);
    } catch {
      this.error.set("Could not load order details. Please contact support.");
    } finally {
      this.loading.set(false);
    }
  }
}
