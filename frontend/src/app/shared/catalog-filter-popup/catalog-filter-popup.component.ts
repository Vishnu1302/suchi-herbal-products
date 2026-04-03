import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  HostListener,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormGroup } from "@angular/forms";
import { Category } from "../../core/models/category.model";

@Component({
  selector: "app-catalog-filter-popup",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./catalog-filter-popup.component.html",
  styleUrl: "./catalog-filter-popup.component.scss",
})
export class CatalogFilterPopupComponent {
  @Input() categories: Category[] = [];
  @Input() filterForm!: FormGroup;
  @Output() cleared = new EventEmitter<void>();

  isOpen = signal(false);

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  close(): void {
    this.isOpen.set(false);
  }

  onClear(): void {
    this.cleared.emit();
    this.close();
  }

  onApply(): void {
    this.close();
  }

  @HostListener("document:keydown.escape")
  onEsc(): void {
    this.close();
  }
}
