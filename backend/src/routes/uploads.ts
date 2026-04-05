import { Router, type Request, type Response } from "express";
import multer, { type FileFilterCallback } from "multer";
import type { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary";
import { requireAdmin } from "../middleware/adminAuth";

const router = Router();

// Use memory storage – file lands in req.file.buffer, never touches disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// POST /api/uploads/image (admin only)
router.post(
  "/image",
  requireAdmin,
  upload.single("image"),
  (req: Request & { file?: Express.Multer.File }, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ message: "No image file received" });
    }

    // Wrap upload_stream in a Promise so we respond exactly once
    const uploadToCloudinary = (): Promise<string> =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "suchi-kids-products", resource_type: "image" },
          (
            error: UploadApiErrorResponse | undefined,
            result: UploadApiResponse | undefined,
          ) => {
            if (error || !result) {
              reject(error ?? new Error("Cloudinary upload failed"));
            } else {
              resolve(result.secure_url);
            }
          },
        );
        stream.end(req.file!.buffer);
      });

    uploadToCloudinary()
      .then((url) => res.json({ url }))
      .catch((err) => {
        console.error("Cloudinary upload error:", err?.message ?? err);
        res
          .status(500)
          .json({ message: "Failed to upload image to Cloudinary" });
      });
  },
);

export default router;
