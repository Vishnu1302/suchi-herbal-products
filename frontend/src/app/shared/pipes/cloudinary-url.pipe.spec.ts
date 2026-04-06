import { CloudinaryUrlPipe } from "./cloudinary-url.pipe";

describe("CloudinaryUrlPipe", () => {
  let pipe: CloudinaryUrlPipe;

  beforeEach(() => {
    pipe = new CloudinaryUrlPipe();
  });

  it("should create", () => {
    expect(pipe).toBeTruthy();
  });

  it("should return empty string for null", () => {
    expect(pipe.transform(null)).toBe("");
  });

  it("should return empty string for undefined", () => {
    expect(pipe.transform(undefined)).toBe("");
  });

  it("should return non-Cloudinary URL unchanged", () => {
    const url = "https://images.unsplash.com/photo-123?w=600";
    expect(pipe.transform(url)).toBe(url);
  });

  it("should insert default width 600 transformations into Cloudinary URL", () => {
    const url = "https://res.cloudinary.com/demo/image/upload/sample.jpg";
    const result = pipe.transform(url);
    expect(result).toContain("/upload/f_auto,q_auto,w_600,c_fill/");
  });

  it("should insert custom width into Cloudinary URL", () => {
    const url = "https://res.cloudinary.com/demo/image/upload/sample.jpg";
    const result = pipe.transform(url, 300);
    expect(result).toContain("/upload/f_auto,q_auto,w_300,c_fill/");
  });

  it("should preserve the rest of the Cloudinary URL after transformation", () => {
    const url = "https://res.cloudinary.com/demo/image/upload/v123/sample.jpg";
    const result = pipe.transform(url, 400);
    expect(result).toBe(
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_400,c_fill/v123/sample.jpg",
    );
  });

  it("should be a pure pipe", () => {
    // calling twice with same input should return same value
    const url = "https://res.cloudinary.com/demo/image/upload/sample.jpg";
    expect(pipe.transform(url, 600)).toBe(pipe.transform(url, 600));
  });
});
