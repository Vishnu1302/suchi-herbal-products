import { TestBed } from "@angular/core/testing";
import {
  HttpClient,
  HttpRequest,
  HttpResponse,
  provideHttpClient,
  withInterceptors,
} from "@angular/common/http";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { signal } from "@angular/core";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { authInterceptor } from "./auth.interceptor";
import { AuthService } from "../services/auth.service";
import { environment } from "../../../environments/environment";

const API_URL = environment.apiUrl;

describe("authInterceptor", () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  function mockUser(token: string) {
    return {
      uid: "u1",
      getIdToken: () => Promise.resolve(token),
    };
  }

  function setup(user: any) {
    const mockAuth = { currentUser: signal(user) };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuth },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  }

  afterEach(() => {
    httpMock.verify();
  });

  it("should attach Bearer token for API requests when logged in", (done) => {
    setup(mockUser("test-token-123"));

    http.get(`${API_URL}/products`).subscribe(() => done());

    // Flush asynchronously after token promise resolves
    setTimeout(() => {
      const req = httpMock.expectOne(`${API_URL}/products`);
      expect(req.request.headers.get("Authorization")).toBe(
        "Bearer test-token-123",
      );
      req.flush([]);
    }, 10);
  });

  it("should NOT attach token for non-API requests", (done) => {
    setup(mockUser("test-token-123"));

    http.get("https://external.example.com/data").subscribe(() => done());

    const req = httpMock.expectOne("https://external.example.com/data");
    expect(req.request.headers.has("Authorization")).toBeFalse();
    req.flush({});
  });

  it("should NOT attach token when user is null (guest)", (done) => {
    setup(null);

    http.get(`${API_URL}/products`).subscribe(() => done());

    const req = httpMock.expectOne(`${API_URL}/products`);
    expect(req.request.headers.has("Authorization")).toBeFalse();
    req.flush([]);
  });
});
