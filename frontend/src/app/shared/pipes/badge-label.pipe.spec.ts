import { BadgeLabelPipe } from "./badge-label.pipe";

describe("BadgeLabelPipe", () => {
  let pipe: BadgeLabelPipe;

  beforeEach(() => {
    pipe = new BadgeLabelPipe();
  });

  it("should create", () => {
    expect(pipe).toBeTruthy();
  });

  it("should return empty string for undefined", () => {
    expect(pipe.transform(undefined)).toBe("");
  });

  it("should return empty string for null", () => {
    expect(pipe.transform(null)).toBe("");
  });

  it("should return empty string for empty string", () => {
    expect(pipe.transform("")).toBe("");
  });

  it('should map "new" to "New"', () => {
    expect(pipe.transform("new")).toBe("New");
  });

  it('should map "sale" to "Sale"', () => {
    expect(pipe.transform("sale")).toBe("Sale");
  });

  it('should map "bestseller" to "Best Seller"', () => {
    expect(pipe.transform("bestseller")).toBe("Best Seller");
  });

  it("should return the raw value for unknown badges", () => {
    expect(pipe.transform("featured")).toBe("featured");
  });
});
