import { type Request, type Response, type NextFunction } from "express";
import * as admin from "firebase-admin";
import path from "path";
import fs from "fs";

// ─────────────────────────────────────────────────────────────────────────────
// Firebase Admin SDK initialisation
//
// Local dev:  place serviceAccountKey.json in the backend/ root folder.
//             It will be picked up automatically.
//
// Production (Render): add env var FIREBASE_SERVICE_ACCOUNT containing the
//             full JSON as a single-line string, e.g.:
//             FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
//
// The JSON file is listed in .gitignore — never commit it to Git.
// ─────────────────────────────────────────────────────────────────────────────

let adminInitialised = false;

function getAdminApp() {
  if (adminInitialised) return admin.app();

  let credential: admin.credential.Credential;

  // Try local file first (dev)
  const localKeyPath = path.resolve(__dirname, "../../serviceAccountKey.json");
  if (fs.existsSync(localKeyPath)) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const serviceAccount = require(localKeyPath);
    credential = admin.credential.cert(serviceAccount);
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Production: parse from env var
    credential = admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT),
    );
  } else {
    throw new Error(
      "Firebase Admin: no credentials found.\n" +
        "  Local dev: add serviceAccountKey.json to backend/\n" +
        "  Production: set FIREBASE_SERVICE_ACCOUNT env var",
    );
  }

  admin.initializeApp({ credential });
  adminInitialised = true;
  return admin.app();
}

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

// ─────────────────────────────────────────────────────────────────────────────
// requireAdmin middleware
//
// Usage:  router.post("/", requireAdmin, yourHandler)
//
// Expects:  Authorization: Bearer <firebase-id-token>
// Rejects:  401 if token missing/invalid, 403 if not an admin email
// ─────────────────────────────────────────────────────────────────────────────
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorised: no token provided" });
  }

  const token = authHeader.slice(7);

  try {
    const app = getAdminApp();
    const decoded = await admin.auth(app).verifyIdToken(token);
    const email = decoded.email ?? "";

    if (!ADMIN_EMAILS.includes(email)) {
      return res.status(403).json({ message: "Forbidden: not an admin" });
    }

    next();
  } catch {
    return res.status(401).json({ message: "Unauthorised: invalid token" });
  }
}
