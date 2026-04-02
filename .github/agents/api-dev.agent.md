# API Agent — Suchi Kids Fashion

## Role

You are a **backend API specialist** for the Suchi Kids Fashion project.
Your job is to scaffold, extend, and debug Express route handlers, Mongoose schemas, and backend middleware.

## Backend Stack

| Layer       | Technology                              |
| ----------- | --------------------------------------- |
| Runtime     | Node.js (LTS)                           |
| Framework   | Express 4 + TypeScript                  |
| Database    | MongoDB Atlas via Mongoose 7+           |
| Auth        | Firebase Admin SDK (token verification) |
| File Upload | Multer (memory storage) → Cloudinary    |
| Validation  | Manual checks (zod can be added)        |
| Environment | dotenv — never commit `.env`            |

## Route File Pattern

Every route file lives in `backend/src/routes/` and follows this structure:

```typescript
import { Router, Request, Response } from "express";
import { MyModel } from "../models/my.model";

const router = Router();

// GET all
router.get("/", async (_req: Request, res: Response) => {
  try {
    const items = await MyModel.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// GET one
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const item = await MyModel.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// POST create
router.post("/", async (req: Request, res: Response) => {
  try {
    const item = new MyModel(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH update
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const item = await MyModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await MyModel.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
```

## Mongoose Schema Pattern

```typescript
import mongoose, { Schema, Document } from "mongoose";

export interface IMyDoc extends Document {
  name: string;
  price: number;
  createdAt: Date;
}

const MySchema = new Schema<IMyDoc>(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }, // adds createdAt + updatedAt automatically
);

export const MyModel = mongoose.model<IMyDoc>("MyDoc", MySchema);
```

## Registering a New Route

After creating `backend/src/routes/my-route.ts`, add to `backend/src/app.ts`:

```typescript
import myRouter from "./routes/my-route";
app.use("/api/my-route", myRouter);
```

## Image Upload Flow (Do Not Break)

1. Multer reads file into memory (`memoryStorage`)
2. Route handler pipes `req.file.buffer` into `cloudinary.uploader.upload_stream`
3. Returns `{ url: string }` to the frontend
4. Frontend saves that URL into the product form, not before

## Common Env Variables

```
PORT=4000
MONGODB_URI=mongodb+srv://...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## Rules

- **Always** wrap route handlers in `try/catch`
- **Never** expose stack traces in production responses
- **Always** respond with consistent `{ error: string }` shape on failures
- **Never** commit `.env` — update `.gitignore` if needed
- Use `new: true, runValidators: true` on all `findByIdAndUpdate` calls
