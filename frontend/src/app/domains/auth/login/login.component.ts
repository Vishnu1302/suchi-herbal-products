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

  private friendlyError(e: any): string {
    switch (e?.code) {
      case "auth/popup-closed-by-user":
      case "auth/cancelled-popup-request":
        return ""; // user dismissed — not an error
      case "auth/popup-blocked":
        return "Pop-up was blocked by your browser. Please allow pop-ups for this site and try again.";
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Invalid email or password. Please try again.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please wait a moment before trying again.";
      case "auth/network-request-failed":
        return "Network error. Please check your connection and try again.";
      case "auth/user-disabled":
        return "This account has been disabled. Please contact support.";
      default:
        return e?.message?.includes("Firebase")
          ? "Sign-in failed. Please try again."
          : (e?.message ?? "Sign-in failed.");
    }
  }

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
      this.error.set(this.friendlyError(e));
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
      this.error.set(this.friendlyError(e));
      this.loading.set(false);
    }
  }
}
