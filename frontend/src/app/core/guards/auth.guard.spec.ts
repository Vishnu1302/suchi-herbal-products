import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { signal } from "@angular/core";
import { authGuard } from "./auth.guard";
import { AuthService } from "../services/auth.service";

describe("authGuard", () => {
  let routerSpy: jasmine.SpyObj<Router>;

  function runGuard() {
    return TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
  }

  function setup(authOverrides: Record<string, any>) {
    routerSpy = jasmine.createSpyObj("Router", ["navigate"]);
    const mockAuth = {
      loading: signal(false),
      currentUser: signal(null),
      ...authOverrides,
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: mockAuth },
      ],
    });
  }

  it("should redirect to /auth/login when not logged in", async () => {
    setup({ currentUser: signal(null) });
    const result = await runGuard();
    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/auth/login"]);
  });

  it("should return true when user is logged in", async () => {
    setup({ currentUser: signal({ uid: "u1" }) });
    const result = await runGuard();
    expect(result as boolean).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it("should wait for loading to complete before checking", async () => {
    const loadingSignal = signal(true);
    setup({ loading: loadingSignal, currentUser: signal(null) });

    setTimeout(() => loadingSignal.set(false), 0);

    const result = await runGuard();
    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/auth/login"]);
  });
});
