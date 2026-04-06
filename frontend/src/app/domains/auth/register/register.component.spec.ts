import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { ReactiveFormsModule } from "@angular/forms";
import { signal } from "@angular/core";
import { RegisterComponent } from "./register.component";
import { AuthService } from "../../../core/services/auth.service";

describe("RegisterComponent", () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  const mockAuthService = {
    currentUser: signal(null),
    loading: signal(false),
    loginWithGoogle: jasmine.createSpy("loginWithGoogle"),
    register: jasmine.createSpy("register"),
    resendVerificationEmail: jasmine.createSpy("resendVerificationEmail"),
  };

  beforeEach(async () => {
    mockAuthService.loginWithGoogle = jasmine.createSpy("loginWithGoogle");
    mockAuthService.register = jasmine.createSpy("register");
    mockAuthService.resendVerificationEmail = jasmine.createSpy(
      "resendVerificationEmail",
    );

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => expect(component).toBeTruthy());

  it("should have an invalid form when empty", () => {
    expect(component.form.valid).toBeFalse();
  });

  it("should require name", () => {
    component.form.setValue({
      name: "",
      email: "t@t.com",
      password: "pass123",
    });
    expect(component.form.controls["name"].hasError("required")).toBeTrue();
  });

  it("should require valid email", () => {
    component.form.setValue({
      name: "Test",
      email: "notEmail",
      password: "pass123",
    });
    expect(component.form.controls["email"].hasError("email")).toBeTrue();
  });

  it("should require password of at least 6 characters", () => {
    component.form.setValue({
      name: "Test",
      email: "t@t.com",
      password: "abc",
    });
    expect(
      component.form.controls["password"].hasError("minlength"),
    ).toBeTrue();
  });

  it("should not call register when form is invalid", fakeAsync(async () => {
    component.form.setValue({ name: "", email: "", password: "" });
    await component.register();
    expect(mockAuthService.register).not.toHaveBeenCalled();
  }));

  it("should call register and show email-sent state on success", fakeAsync(async () => {
    mockAuthService.register.and.returnValue(Promise.resolve({ uid: "u1" }));
    component.form.setValue({
      name: "Test",
      email: "test@test.com",
      password: "password123",
    });
    await component.register();
    tick();
    expect(mockAuthService.register).toHaveBeenCalledWith(
      "Test",
      "test@test.com",
      "password123",
    );
    expect(component.emailSent()).toBeTrue();
    expect(component.sentEmail()).toBe("test@test.com");
  }));

  it("should set error for email-already-in-use", fakeAsync(async () => {
    mockAuthService.register.and.returnValue(
      Promise.reject({ code: "auth/email-already-in-use" }),
    );
    component.form.setValue({
      name: "Test",
      email: "existing@test.com",
      password: "password123",
    });
    await component.register();
    tick();
    expect(component.error()).toContain("already registered");
  }));

  it("tryAgain should reset emailSent and form", () => {
    component.emailSent.set(true);
    component.sentEmail.set("test@test.com");
    component.tryAgain();
    expect(component.emailSent()).toBeFalse();
    expect(component.sentEmail()).toBe("");
    expect(component.form.value.name).toBeNull();
  });

  it("resend should call resendVerificationEmail", fakeAsync(async () => {
    mockAuthService.resendVerificationEmail.and.returnValue(Promise.resolve());
    await component.resend();
    tick();
    expect(mockAuthService.resendVerificationEmail).toHaveBeenCalled();
    expect(component.loading()).toBeFalse();
  }));
});
