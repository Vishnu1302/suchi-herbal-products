import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { signal } from "@angular/core";
import { adminGuard } from "./admin.guard";
import { AuthService } from "../services/auth.service";

describe("adminGuard", () => {
  let routerSpy: jasmine.SpyObj<Router>;
  let mockAuth: any;

  function runGuard() {
    return TestBed.runInInjectionContext(() =>
      adminGuard({} as any, {} as any),
    );
  }

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj("Router", ["navigate"]);
  });

  /** Helper: configures TestBed with the given auth signals */
  function setup(overrides: Partial<typeof mockAuth>) {
    mockAuth = {
      loading: signal(false),
      currentUser: signal(null),
      isAdmin: false,
      ...overrides,
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: mockAuth },
      ],
    });
  }

  it("should redirect to /auth/login when not logged in", async () => {
    setup({ currentUser: signal(null), isAdmin: false });
    const result = await runGuard();
    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/auth/login"]);
  });

  it("should redirect to / when logged in but not admin", async () => {
    setup({
      currentUser: signal({ uid: "u1", email: "user@example.com" }),
      isAdmin: false,
    });
    const result = await runGuard();
    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/"]);
  });

  it("should return true when logged in and admin", async () => {
    setup({
      currentUser: signal({ uid: "u1", email: "vishnudeekshit@gmail.com" }),
      isAdmin: true,
    });
    const result = await runGuard();
    expect(result as boolean).toBeTrue();
  });

  it("should wait for auth loading to finish before checking", async () => {
    // Starts with loading=true; the guard must await before checking
    const loadingSignal = signal(true);
    setup({
      loading: loadingSignal,
      currentUser: signal(null),
      isAdmin: false,
    });

    // Resolve loading asynchronously after 0ms
    setTimeout(() => loadingSignal.set(false), 0);

    const result = await runGuard();
    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(["/auth/login"]);
  });
});
