import { DiscountPipe } from "./discount.pipe";

describe("DiscountPipe", () => {
  let pipe: DiscountPipe;

  beforeEach(() => {
    pipe = new DiscountPipe();
  });

  it("should create", () => {
    expect(pipe).toBeTruthy();
  });

  it("should return 0 when originalPrice is undefined", () => {
    expect(pipe.transform(249, undefined)).toBe(0);
  });

  it("should return 0 when originalPrice is null", () => {
    expect(pipe.transform(249, null)).toBe(0);
  });

  it("should return 0 when originalPrice equals price", () => {
    expect(pipe.transform(249, 249)).toBe(0);
  });

  it("should return 0 when originalPrice is less than price", () => {
    expect(pipe.transform(300, 200)).toBe(0);
  });

  it("should calculate 50% discount correctly", () => {
    expect(pipe.transform(250, 500)).toBe(50);
  });

  it("should calculate 20% discount correctly", () => {
    expect(pipe.transform(400, 500)).toBe(20);
  });

  it("should round fractional percentages", () => {
    // (199 - 149) / 199 = 25.12... → rounds to 25
    expect(pipe.transform(149, 199)).toBe(25);
  });

  it("should return 100 for a free (price=0) product from original", () => {
    expect(pipe.transform(0, 100)).toBe(100);
  });
});
