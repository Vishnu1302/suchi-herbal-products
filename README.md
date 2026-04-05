# Aurea — Herbal Skincare E-Commerce Platform

A full-stack e-commerce platform for Aurea herbal skincare products.

---

## Tech Stack

| Layer            | Technology                          | Purpose                                         |
| ---------------- | ----------------------------------- | ----------------------------------------------- |
| Frontend         | Angular 17+ (standalone components) | Customer-facing storefront + admin panel        |
| State            | Angular Signals + NgRx (cart)       | Local state management                          |
| Auth             | Firebase Authentication             | Google + Email/Password sign-in                 |
| Backend          | Node.js + Express + TypeScript      | REST API                                        |
| Database         | MongoDB Atlas (Mongoose)            | Product, order, inventory data                  |
| Images           | Cloudinary                          | Product image storage and delivery              |
| Payments         | Razorpay                            | Indian payment gateway (UPI, cards, netbanking) |
| Backend Hosting  | Render                              | Deploys the Express API                         |
| Frontend Hosting | Firebase Hosting                    | Serves the Angular production build             |

---

## Project Structure

```
SuchiHerbalProducts/
├── frontend/          # Angular app (deployed to Firebase Hosting)
├── backend/           # Express API (deployed to Render)
├── infrastructure/    # Deployment notes
├── firebase.json      # Firebase Hosting config
├── .firebaserc        # Firebase project binding (aurea-c47f9)
└── README.md
```

---

## Databases

| Environment         | MongoDB Database | When used             |
| ------------------- | ---------------- | --------------------- |
| Local development   | `test` (default) | `npm run dev` locally |
| Production (Render) | `aurea`          | Live deployment       |

The database name is set via the `MONGODB_URI` environment variable:

- **Local** `.env`: `mongodb+srv://...mongodb.net/test?...`
- **Render** env var: `mongodb+srv://...mongodb.net/aurea?...`

MongoDB Atlas automatically creates the database on first document insert — no manual setup needed.

---

## Image Storage — Cloudinary

All product images are uploaded through the backend:

1. Admin selects an image in the product form
2. On form submit, the frontend sends the file to `POST /api/uploads/image`
3. The backend (Multer) receives the file in memory and streams it to Cloudinary
4. Cloudinary returns a `secure_url` which is saved in the product document

**Why backend?** The Cloudinary API secret must never be exposed in the browser.

Cloudinary project: `dpoaxbatj` — images stored in folder `suchi-kids-products/`.

---

## Payments — Razorpay

| Mode | Key prefix     | When                                                                          |
| ---- | -------------- | ----------------------------------------------------------------------------- |
| Test | `rzp_test_...` | Local development                                                             |
| Live | `rzp_live_...` | Production (before go-live, update `environment.prod.ts` and Render env vars) |

Payment flow:

1. Frontend sends order details to `POST /api/orders/create`
2. Backend creates a Razorpay order and returns `razorpayOrderId`
3. Razorpay checkout modal opens in browser
4. On success, frontend calls `POST /api/orders/:id/verify-payment` (HMAC signature check)
5. Razorpay webhook (`POST /api/payments/webhook`) provides authoritative confirmation

---

## Hosting

### Backend — Render

- **URL:** `https://suchi-herbal-products.onrender.com`
- **Root Directory:** `backend`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Plan:** Free (spins down after 15 min inactivity — first request after sleep takes ~30s)

Required Render environment variables:

```
MONGODB_URI=mongodb+srv://<user>:<password>@herbal-products.pfvaun0.mongodb.net/aurea?appName=herbal-products
CLOUDINARY_CLOUD_NAME=dpoaxbatj
CLOUDINARY_API_KEY=<your key>
CLOUDINARY_API_SECRET=<your secret>
RAZORPAY_KEY_ID=rzp_live_<your key>
RAZORPAY_KEY_SECRET=<your secret>
RAZORPAY_WEBHOOK_SECRET=<your webhook secret>
CLIENT_URL=https://aurea-c47f9.web.app
NODE_ENV=production
```

### Frontend — Firebase Hosting

- **URL:** `https://aurea-c47f9.web.app`
- **Firebase project:** `aurea-c47f9`
- **Build output:** `frontend/dist/suchi-kids-fashion/browser`

Deploy commands:

```bash
cd frontend
npm run build -- --configuration production
cd ..
firebase deploy --only hosting
```

---

## Local Development

### Backend

```bash
cd backend
npm install
# create .env with local values (see .env.example)
npm run dev       # ts-node-dev with hot reload on port 4000
```

### Frontend

```bash
cd frontend
npm install
npm start         # ng serve on port 4200, proxies API to localhost:4000
```

---

## MongoDB Atlas Setup

- Cluster: `herbal-products` (free M0 tier)
- Network Access: `0.0.0.0/0` (required for Render — dynamic IPs)
- Database user: has `readWriteAnyDatabase` role
- **Never commit credentials** — stored in `.env` (gitignored) and Render env vars

---

## Environment Files

| File                                            | Used for                                          |
| ----------------------------------------------- | ------------------------------------------------- |
| `backend/.env`                                  | Local backend secrets (never committed)           |
| `frontend/src/environments/environment.ts`      | Local Angular config                              |
| `frontend/src/environments/environment.prod.ts` | Production Angular config (committed, no secrets) |

---

## API Security Reference

### Route Protection Model

| Route                            | Method | Protected         | Who can call                   |
| -------------------------------- | ------ | ----------------- | ------------------------------ |
| `/api/products`                  | GET    | ❌ Public         | Anyone                         |
| `/api/products/:id`              | GET    | ❌ Public         | Anyone                         |
| `/api/products`                  | POST   | ✅ Admin token    | Logged-in admin only           |
| `/api/products/:id`              | PUT    | ✅ Admin token    | Logged-in admin only           |
| `/api/products/:id`              | DELETE | ✅ Admin token    | Logged-in admin only           |
| `/api/inventory`                 | GET    | ❌ Public         | Anyone                         |
| `/api/inventory/:productId`      | GET    | ❌ Public         | Anyone                         |
| `/api/inventory/update-stock`    | POST   | ✅ Admin token    | Logged-in admin only           |
| `/api/orders/create`             | POST   | ❌ Public         | Anyone (guest checkout)        |
| `/api/orders/:id`                | GET    | ❌ Public         | Anyone with order ID           |
| `/api/orders/:id/verify-payment` | POST   | ❌ Public         | Anyone (called after Razorpay) |
| `/api/orders`                    | GET    | ✅ Admin token    | Logged-in admin only           |
| `/api/orders/stats`              | GET    | ✅ Admin token    | Logged-in admin only           |
| `/api/orders/:id/status`         | PATCH  | ✅ Admin token    | Logged-in admin only           |
| `/api/uploads/image`             | POST   | ✅ Admin token    | Logged-in admin only           |
| `/api/payments/webhook`          | POST   | ✅ HMAC signature | Razorpay servers only          |

**How protection works:** Angular HTTP interceptor attaches `Authorization: Bearer <firebase-token>` on every logged-in request. Backend `requireAdmin` middleware in `backend/src/middleware/adminAuth.ts` verifies the token using Firebase Admin SDK and checks the email against `ADMIN_EMAILS` env var.

---

### Security Test — curl Commands

Run these against the **production URL** to verify protection is working.  
Replace `https://suchi-herbal-products.onrender.com` if URL changes.

**PUBLIC routes — expect `200` or `400` (never `401`)**

```bash
# List all products
curl -X GET https://suchi-herbal-products.onrender.com/api/products

# Single product
curl -X GET https://suchi-herbal-products.onrender.com/api/products/69d10ce47de4a90813428aa5

# Guest order create — expect 400 (cart empty validation, NOT blocked)
curl -X POST https://suchi-herbal-products.onrender.com/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{"items":[],"customer":{}}'
```

**ADMIN PROTECTED routes — ALL must return `401 Unauthorised` without a token**

```bash
# Try to create a product (no token)
curl -X POST https://suchi-herbal-products.onrender.com/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"hack","price":1,"category":"soap","slug":"hack","description":"x","ingredients":"x","usage":"x"}'

# Try to update a product (no token)
curl -X PUT https://suchi-herbal-products.onrender.com/api/products/69d10ce47de4a90813428aa5 \
  -H "Content-Type: application/json" \
  -d '{"price": 1}'

# Try to delete a product (no token)
curl -X DELETE https://suchi-herbal-products.onrender.com/api/products/69d10ce47de4a90813428aa5

# Try to list all orders (exposes customer PII) — must be 401
curl -X GET https://suchi-herbal-products.onrender.com/api/orders

# Try to get order stats — must be 401
curl -X GET https://suchi-herbal-products.onrender.com/api/orders/stats

# Try to zero out inventory — must be 401
curl -X POST https://suchi-herbal-products.onrender.com/api/inventory/update-stock \
  -H "Content-Type: application/json" \
  -d '{"productId":"69d10ce47de4a90813428aa5","newStock":0}'

# Try to change order status — must be 401
curl -X PATCH https://suchi-herbal-products.onrender.com/api/orders/69d10ce47de4a90813428aa5/status \
  -H "Content-Type: application/json" \
  -d '{"status":"delivered"}'

# Try to upload image — must be 401
curl -X POST https://suchi-herbal-products.onrender.com/api/uploads/image
```

**Expected results summary:**

| Test                             | Expected HTTP |
| -------------------------------- | ------------- |
| GET /api/products                | `200`         |
| GET /api/products/:id            | `200`         |
| POST /api/orders/create (empty)  | `400`         |
| POST /api/products               | `401` ✅      |
| PUT /api/products/:id            | `401` ✅      |
| DELETE /api/products/:id         | `401` ✅      |
| GET /api/orders                  | `401` ✅      |
| GET /api/orders/stats            | `401` ✅      |
| POST /api/inventory/update-stock | `401` ✅      |
| PATCH /api/orders/:id/status     | `401` ✅      |
| POST /api/uploads/image          | `401` ✅      |
