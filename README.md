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
