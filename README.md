# Sai Punjabi — Authentic Amritsari & Punjabi Food Platform

[![Production Ready](https://img.shields.io/badge/status-production--ready-brightgreen.svg)]()
[![Stack](https://img.shields.io/badge/stack-Next.js%2014%20%7C%20Express%20%7C%20MongoDB%20Atlas%20%7C%20Socket.IO%20%7C%20Razorpay-maroon.svg)]()

**Sai Punjabi** is a full-stack, enterprise-grade restaurant web application and management platform. It combines a Next.js App Router storefront with a Node.js/Express REST & Real-time WebSocket API and MongoDB persistence.

---

## Architecture Overview

```
Saipunjabifoods/
├── apps/
│   ├── api/                     # Express.js REST API + Socket.IO + Mongoose
│   │   ├── src/
│   │   │   ├── config/          # Environment variables, DB connection, Swagger
│   │   │   ├── constants/       # Status codes, order states, roles
│   │   │   ├── controllers/     # Route controllers (Auth, Products, Orders, Payments, etc.)
│   │   │   ├── middleware/      # JWT cookies, RBAC, Zod validation, rate limiting
│   │   │   ├── models/          # Mongoose models (User, Product, Order, Promo, etc.)
│   │   │   ├── routes/          # Express route definitions (/api/v1/...)
│   │   │   ├── services/        # Cart calculations, Razorpay HMAC, Promotions engine
│   │   │   ├── sockets/         # Socket.IO order tracking gateway
│   │   │   ├── utils/           # Cryptographic signature verification, tokens
│   │   │   ├── seeds/           # Database seed script for admin & Punjabi dishes
│   │   │   └── server.ts        # Entry point
│   │   └── tests/               # Vitest automated test suite (5/5 passing)
│   │
│   └── web/                     # Next.js 14 App Router Frontend + Tailwind CSS
│       ├── src/
│       │   ├── app/             # App Router pages (Home, Menu, Products, Cart, Checkout, Admin, Tracking, SEO)
│       │   ├── components/      # Navbar, Footer, ProductCard, CartDrawer, Timeline, Badges
│       │   ├── context/         # AuthContext, CartContext, SocketContext
│       │   └── lib/             # Typed API client, formatters
│
├── packages/
│   └── shared/                  # Shared TypeScript models, Zod schemas, constants
│
├── package.json                 # Monorepo root with npm workspaces
├── .env.example                 # Environment variables template
└── README.md
```

---

## Features & Modules

### 1. Storefront Experience
- **Brand Identity**: Royal Amritsari heritage aesthetics with Deep Maroon (`#7A131A`), Warm Cream (`#FFFDF9`), and Saffron Gold (`#D97706`).
- **Interactive Menu**: Category filtering, real-time search, Pure Veg / Non-Veg toggle, spice-level filter, portion selection (Half/Full), add-ons (extra butter, mint chutney), and price calculation.
- **Dynamic Festival Offers**: Festival promotions banner (Diwali, Baisakhi, Holi, etc.) with 1-click coupon code copying and automatic discount breakdown.
- **Customer Reviews**: Rating distribution (5★ to 1★), verified purchase badges, review submission modal with customer sentiment tracking.

### 2. Shopping Cart & Multi-Step Checkout
- **Server-Side Recalculations**: All product base prices, portion multipliers, add-ons, GST (5%), delivery fees, and promo discounts are recalculated on the backend—preventing client price tampering.
- **Delivery Rules**: Configurable free delivery threshold (e.g. Orders above ₹499 get free delivery).
- **Payment Methods**:
  - **Online Razorpay**: Secure order creation, checkout modal, cryptographic HMAC-SHA256 signature verification, and idempotent webhook handling.
  - **Cash on Delivery (COD)**: Configurable store-level toggle.
- **Guest & Authenticated Carts**: Seamless local storage cart persistence and automatic cart merging upon customer login.

### 3. Real-Time Order Tracking
- **Order State Machine**:
  `pending` ➔ `confirmed` ➔ `preparing` ➔ `ready_for_pickup` / `out_for_delivery` ➔ `delivered` (or `cancelled`).
- **Live WebSocket Streaming**: Connected via Socket.IO room subscriptions (`order:<orderId>`).
- **Polling Fallback**: Built-in 12-second resilient fallback polling if WebSocket drops.
- **Visual Status Timeline**: Real-time progress bar with estimated preparation and delivery countdowns.

### 4. Protected Admin Dashboard
- **Executive Analytics**: Verified revenue, active orders count, completed deliveries, popular dishes ordered, active promo campaigns.
- **Live Order Control**: Status dropdown with immediate WebSocket push to customer tracking screens.
- **Dish & Stock Management**: Real-time "In Stock / Sold Out" kitchen toggle, price adjustments, and variant configuration.
- **Festival Campaign Scheduler**: Create percentage or fixed amount discounts, promo codes, start/end date-times, minimum cart value, and maximum savings caps.
- **Review Moderation Queue**: Approve or reject customer reviews, attach official restaurant chef replies.
- **Customer Accounts**: Search customers, review order volume and lifetime spend, toggle account active status.
- **Restaurant Operational Settings**: Update opening hours, telephone, address, GST tax rate, and store announcement banner.

---

## Getting Started (Local Setup Guide)

### Prerequisites
- **Node.js**: v18.0.0 or higher (v22 tested)
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance or free MongoDB Atlas cluster

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd Saipunjabifoods

# Install all monorepo workspace dependencies
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```

### 3. Build Shared Packages
```bash
npm run build --workspace=packages/shared
```

### 4. Seed the Database
Run the secure database seeder to create the initial Administrator account, food categories, signature Punjabi dishes, and festival promotions:
```bash
npm run seed --workspace=apps/api
```

### 5. Start Development Servers
Start both the Backend API and Next.js Storefront concurrently:
```bash
# Terminal 1: Start Express API + WebSocket Gateway
npm run dev:api

# Terminal 2: Start Next.js App Router Storefront
npm run dev:web
```

- **Next.js Storefront**: [http://localhost:3000](http://localhost:3000)
- **REST API Server**: [http://localhost:5000](http://localhost:5000)
- **Swagger OpenAPI Docs**: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## Default Credentials (from Seed)

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@saipunjabifoods.com` | `Admin@SaiPunjabi2026!` (configurable via `ADMIN_PASSWORD`) |

---

## Running Automated Tests

Run the Vitest test suite covering security, cryptographic signature verification, Zod input validation, and token signing:
```bash
npm run test --workspace=apps/api
```

---

## MongoDB Atlas Setup Guide

1. Sign up or log in at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 Sandbox** cluster in your preferred region (e.g. AWS Mumbai `ap-south-1`).
3. Under **Security > Database Access**, add a new database user (e.g., `sai_admin`) with password.
4. Under **Security > Network Access**, click **Add IP Address** and add your server's IP address (or `0.0.0.0/0` for development).
5. In your cluster dashboard, click **Connect > Drivers > Node.js** and copy the connection string.
6. Paste the connection string into `.env`:
   ```env
   MONGODB_URI=mongodb+srv://sai_admin:<password>@cluster0.xxxxx.mongodb.net/sai_punjabi?retryWrites=true&w=majority
   ```

---

## Razorpay Test-Mode Integration Guide

1. Log in to your [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Navigate to **Account & Settings > API Keys**.
3. Generate a **Test Key ID** and **Key Secret**.
4. Set the keys in `.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_test_YourKeyIdHere
   RAZORPAY_KEY_SECRET=YourKeySecretHere
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YourKeyIdHere
   ```
5. *(Optional)* To test real-time payment webhooks:
   - Navigate to **Settings > Webhooks > Add New Webhook**.
   - Set Webhook URL to: `https://your-domain.com/api/v1/payments/webhook`.
   - Select events: `payment.captured`, `payment.failed`.
   - Set secret in `RAZORPAY_WEBHOOK_SECRET`.

> **Note for Local Development**: If Razorpay keys are left as placeholder values, the application automatically enables **Simulated Test Mode**, allowing complete end-to-end checkout, payment simulation, and order confirmation without requiring live banking credentials.

---

## Production Launch Checklist

- [x] Configure strict production `MONGODB_URI` using MongoDB Atlas with replica sets.
- [x] Generate a strong 64-character random string for `JWT_SECRET` and `COOKIE_SECRET`.
- [x] Set `NODE_ENV=production` and configure proper domain origins in `CLIENT_ORIGIN`.
- [x] Switch `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to Live production keys.
- [x] Run `npm run seed --workspace=apps/api` with secure `ADMIN_PASSWORD` to create the initial admin account.
- [x] Verify `/robots.txt` and `/sitemap.xml` for search engine indexing.
- [x] Enable SSL/HTTPS certificates on domain with reverse proxy (e.g., NGINX, Vercel, or AWS ALB).
- [x] Run production test suite `npm run test` and verify zero vulnerabilities.

---

## License

Proprietary © Sai Punjabi Foods. All rights reserved.
# SaiPunjabiFoods
# SaiPunjabiFoods
