import { Pipe, PipeTransform } from "@angular/core";

/**
 * Transforms a raw Cloudinary upload URL to an optimised delivery URL.
 *
 * Applied transformations:
 *   f_auto   — serve WebP to Chrome/Edge, AVIF where supported, fallback JPEG
 *   q_auto   — Cloudinary picks optimal compression automatically
 *   w_{width} — resize to the displayed width (avoids downloading oversized originals)
 *   c_fill   — crop to fill (keeps aspect ratio)
 *
 * Usage in templates:
 *   <img [src]="image | cloudinaryUrl:600" />
 *   <img [src]="image | cloudinaryUrl:300" />
 *
 * Non-Cloudinary URLs are returned unchanged.
 */
@Pipe({ name: "cloudinaryUrl", standalone: true, pure: true })
export class CloudinaryUrlPipe implements PipeTransform {
  transform(url: string | null | undefined, width = 600): string {
    if (!url) return "";
    if (!url.includes("res.cloudinary.com")) return url;

    // Insert transformations between /upload/ and the version/path
    return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},c_fill/`);
  }
}
