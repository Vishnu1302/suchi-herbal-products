import { Injectable, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "../../../environments/environment";
import {
  Auth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { FirebaseAuthToken } from "./firebase.service";

@Injectable({ providedIn: "root" })
export class AuthService {
  private auth = inject(FirebaseAuthToken);
  private router = inject(Router);

  currentUser = signal<User | null>(null);
  loading = signal(true);

  constructor() {
    onAuthStateChanged(this.auth as Auth, (user) => {
      this.currentUser.set(user);
      this.loading.set(false);
    });
  }

  get isLoggedIn() {
    return this.currentUser() !== null;
  }

  get isAdmin() {
    const email = this.currentUser()?.email;
    return !!email && environment.adminEmails.includes(email);
  }

  get userEmail() {
    return this.currentUser()?.email ?? null;
  }

  get displayName() {
    return (
      this.currentUser()?.displayName ?? this.currentUser()?.email ?? "User"
    );
  }

  get photoURL() {
    return this.currentUser()?.photoURL ?? null;
  }

  /**
   * True when:
   * - Signed in with Google (always verified by Google)
   * - Signed in with email and Firebase has confirmed the email
   */
  get isEmailVerified() {
    const user = this.currentUser();
    if (!user) return false;
    // Google-authenticated users are always considered verified
    const isGoogle = user.providerData.some(
      (p) => p.providerId === "google.com",
    );
    return isGoogle || user.emailVerified;
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth as Auth, provider);
    return result.user;
  }

  async loginWithEmail(email: string, password: string) {
    const result = await signInWithEmailAndPassword(
      this.auth as Auth,
      email,
      password,
    );
    return result.user;
  }

  async register(name: string, email: string, password: string) {
    const result = await createUserWithEmailAndPassword(
      this.auth as Auth,
      email,
      password,
    );
    await updateProfile(result.user, { displayName: name });
    // Send verification email immediately after registration
    await sendEmailVerification(result.user);
    return result.user;
  }

  async resendVerificationEmail() {
    const user = this.currentUser();
    if (user && !user.emailVerified) {
      await sendEmailVerification(user);
    }
  }

  async logout() {
    await signOut(this.auth as Auth);
    this.router.navigate(["/"]);
  }
}
