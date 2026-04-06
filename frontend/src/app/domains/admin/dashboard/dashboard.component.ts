import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { AdminProductService } from "../products/products.service";
import { AdminOrdersService } from "../orders/orders.service";
import { AdminInventoryService } from "../inventory/inventory.service";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
})
export class DashboardComponent implements OnInit {
  private readonly productSvc = inject(AdminProductService);
  private readonly orderSvc = inject(AdminOrdersService);
  private readonly inventorySvc = inject(AdminInventoryService);

  productStats = { total: 0, inStock: 0, outOfStock: 0, lowStock: 0 };
  orderStats = {
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0,
  };
  inventoryStats = { total: 0, inStock: 0, lowStock: 0, outOfStock: 0 };

  ngOnInit() {
    this.productStats = this.productSvc.getStats();
    this.orderSvc.getStats().subscribe((stats) => (this.orderStats = stats));
    this.inventoryStats = this.inventorySvc.getStats();
  }
}
