import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authSvc = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal("");

  form = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required, Validators.minLength(6)]],
  });

  async loginGoogle() {
    this.loading.set(true);
    this.error.set("");
    try {
      await this.authSvc.loginWithGoogle();
      this.router.navigate(["/"]);
    } catch (e: any) {
      this.error.set(e.message ?? "Google sign-in failed");
      this.loading.set(false);
    }
  }

  async loginEmail() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set("");
    try {
      await this.authSvc.loginWithEmail(
        this.form.value.email!,
        this.form.value.password!,
      );
      this.router.navigate(["/"]);
    } catch (e: any) {
      this.error.set(
        e.code === "auth/invalid-credential"
          ? "Invalid email or password"
          : (e.message ?? "Sign-in failed"),
      );
      this.loading.set(false);
    }
  }
}
