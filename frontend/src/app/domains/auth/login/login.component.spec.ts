import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { ReactiveFormsModule } from "@angular/forms";
import { signal } from "@angular/core";
import { LoginComponent } from "./login.component";
import { AuthService } from "../../../core/services/auth.service";

describe("LoginComponent", () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;

  const mockAuthService = {
    currentUser: signal(null),
    loading: signal(false),
    isLoggedIn: false,
    isEmailVerified: true,
    loginWithGoogle: jasmine.createSpy("loginWithGoogle"),
    loginWithEmail: jasmine.createSpy("loginWithEmail"),
    register: jasmine.createSpy("register"),
    logout: jasmine.createSpy("logout"),
    resendVerificationEmail: jasmine.createSpy("resendVerificationEmail"),
  };

  beforeEach(async () => {
    mockAuthService.loginWithGoogle = jasmine.createSpy("loginWithGoogle");
    mockAuthService.loginWithEmail = jasmine.createSpy("loginWithEmail");

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, "navigate");

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should have an invalid form when empty", () => {
    expect(component.form.valid).toBeFalse();
  });

  it("should validate email format", () => {
    component.form.setValue({ email: "not-an-email", password: "pass123" });
    expect(component.form.controls["email"].hasError("email")).toBeTrue();
  });

  it("should validate minimum password length (6)", () => {
    component.form.setValue({ email: "test@test.com", password: "abc" });
    expect(
      component.form.controls["password"].hasError("minlength"),
    ).toBeTrue();
  });

  it("should have a valid form with correct values", () => {
    component.form.setValue({
      email: "test@test.com",
      password: "password123",
    });
    expect(component.form.valid).toBeTrue();
  });

  it("should not call loginWithEmail when form is invalid", fakeAsync(async () => {
    component.form.setValue({ email: "", password: "" });
    await component.loginEmail();
    expect(mockAuthService.loginWithEmail).not.toHaveBeenCalled();
  }));

  it("should call loginWithEmail and navigate on success", fakeAsync(async () => {
    mockAuthService.loginWithEmail.and.returnValue(
      Promise.resolve({ uid: "u1" }),
    );
    component.form.setValue({
      email: "test@test.com",
      password: "password123",
    });
    await component.loginEmail();
    tick();
    expect(mockAuthService.loginWithEmail).toHaveBeenCalledWith(
      "test@test.com",
      "password123",
    );
    expect(router.navigate).toHaveBeenCalledWith(["/"]);
  }));

  it("should set error message for invalid-credential code", fakeAsync(async () => {
    mockAuthService.loginWithEmail.and.returnValue(
      Promise.reject({ code: "auth/invalid-credential" }),
    );
    component.form.setValue({
      email: "test@test.com",
      password: "password123",
    });
    await component.loginEmail();
    tick();
    expect(component.error()).toContain("Invalid email or password");
  }));

  it("should call loginWithGoogle and navigate on success", fakeAsync(async () => {
    mockAuthService.loginWithGoogle.and.returnValue(
      Promise.resolve({ uid: "u1" }),
    );
    await component.loginGoogle();
    tick();
    expect(router.navigate).toHaveBeenCalledWith(["/"]);
  }));

  it("should set empty error for popup-closed-by-user", fakeAsync(async () => {
    mockAuthService.loginWithGoogle.and.returnValue(
      Promise.reject({ code: "auth/popup-closed-by-user" }),
    );
    await component.loginGoogle();
    tick();
    expect(component.error()).toBe("");
  }));

  it("should set loading false after login failure", fakeAsync(async () => {
    mockAuthService.loginWithEmail.and.returnValue(
      Promise.reject({ code: "auth/too-many-requests" }),
    );
    component.form.setValue({
      email: "test@test.com",
      password: "password123",
    });
    await component.loginEmail();
    tick();
    expect(component.loading()).toBeFalse();
  }));
});
