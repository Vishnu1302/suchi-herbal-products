import { Component } from "@angular/core";
import { RouterOutlet, RouterLink, RouterLinkActive } from "@angular/router";
import { CommonModule } from "@angular/common";

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: "app-admin-shell",
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: "./admin-shell.component.html",
  styleUrl: "./admin-shell.component.scss",
})
export class AdminShellComponent {
  sidebarCollapsed = false;

  navItems: NavItem[] = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: "fa-solid fa-chart-line",
    },
    {
      label: "Products",
      path: "/admin/products",
      icon: "fa-solid fa-box-open",
    },
    {
      label: "Inventory",
      path: "/admin/inventory",
      icon: "fa-solid fa-warehouse",
    },
    { label: "Orders", path: "/admin/orders", icon: "fa-solid fa-receipt" },
  ];
}
