import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

/**
 * Root shell — layout (navbar/sidebar/footer) is handled per domain:
 *  • Shop domain  → ShopShellComponent (has its own navbar + footer)
 *  • Admin domain → AdminShellComponent (has its own sidebar)
 */
@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: "./app.component.html",
})
export class AppComponent {
  title = "veda";
}
