import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./register.component.html",
  styleUrls: ["../login/login.component.scss"],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authSvc = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal("");
  emailSent = signal(false);
  sentEmail = signal("");

  form = this.fb.group({
    name: ["", Validators.required],
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required, Validators.minLength(6)]],
  });

  get f() {
    return this.form.controls;
  }

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

  async register() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set("");
    try {
      await this.authSvc.register(
        this.form.value.name!,
        this.form.value.email!,
        this.form.value.password!,
      );
      this.sentEmail.set(this.form.value.email!);
      this.emailSent.set(true);
      this.loading.set(false);
    } catch (e: any) {
      this.error.set(
        e.code === "auth/email-already-in-use"
          ? "Email is already registered. Please sign in."
          : (e.message ?? "Registration failed"),
      );
      this.loading.set(false);
    }
  }

  async resend() {
    this.loading.set(true);
    this.error.set("");
    try {
      await this.authSvc.resendVerificationEmail();
      this.loading.set(false);
    } catch (e: any) {
      this.error.set(e.message ?? "Could not resend email");
      this.loading.set(false);
    }
  }
}
