import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [RouterLink],
  styleUrl: "./home.component.scss",
  templateUrl: "./home.component.html",
})
export class HomeComponent {}
