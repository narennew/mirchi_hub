# Mirchi Chaats — Direct Food Ordering Web Platform

A high-performance, mobile-first direct food commerce platform built for **Mirchi Chaats**, located on **Vysial Street, Town Hall, Coimbatore, Tamil Nadu (641001)**.

Built with **Next.js 16 (App Router & Turbopack)**, **TypeScript**, **Tailwind CSS**, a **modular Delivery Service Layer**, and a **secure Admin Command Center**.

---

## 🌟 Key Features

### 1. Customer Ordering & Street-Food UX
- **Mobile-First Experience**: Sticky navigation, smooth category scrolling, responsive food cards, and floating mobile bottom cart bar.
- **Reference Menu Catalogue (31 Dishes)**: Handcrafted from the Vysial Street Swiggy reference menu across 11 categories:
  - *Recommended & Bestsellers* (Masala Puri, Bhel Puri, Pani Puri, Gulab Jamun)
  - *Mirchi Chaats* (Masala Samosa, Masala Kachori, Mushroom Bhel, Mirchi Masala)
  - *Dahi Chaats* (Dahi Puri, Dahi Papdi, Dahi Samosa, Dahi Cutlet, Dahi Kachori)
  - *Combos & Meals* (Combo 1, Combo 2, Combo 3)
  - *Pav Bhaji & Cheese Pav Bhaji* (Plain Pav Bhaji, Cheese Pav Bhaji)
  - *Tawa Fry Items* (Mushroom Manchurian, Masala Cutlet, Fry Samosa, Fry Cutlet, Fry Kachodi)
  - *Munchies & Snacks* (Plain Samosa, Plain Kachori, Plain Cutlet)
  - *Kids Specials* (Cheese Sev Papdi)
  - *Mojitos & Beverages* (Lemon Mint Mojito, Blue Coraco, Masala 7Up, Masala Pepsi)
- **Dish Customization**: Configurable spice levels (*Mild*, *Medium*, *Extra Spicy*) and add-ons (*Extra Sev*, *Extra Dahi*, *Extra Pav*, *Extra Chutney*).
- **Cart & Pricing Engine**: Real-time itemized calculation with 5% restaurant GST, tiered delivery fee, and free delivery progress tracking (free above ₹399).
- **Configurable Promotional Codes**: Instant promo validation (`WELCOME50`, `CHAAT20`, `TOWNHALL10`).
- **Live Order Milestone Tracking**: Dynamic status timeline (`/order/MC-2026-XXXX`) with 1-click reorder and printable receipt.

### 2. Modular Delivery Service Layer
- **Multi-Provider Architecture**:
  - `Shop In-House Delivery (Town Hall Fleet)`: Active by default for direct shop deliveries within Coimbatore.
  - `Dunzo for Business`: Ready for B2B courier API connection.
  - `Porter Enterprise`: Ready for 2-wheeler / 3-wheeler parcel API connection.
  - `Rapido Bike Courier`: **Kept disabled by default** with regulatory compliance notice.
- **Tamil Nadu Transport Regulation Compliance**:
  > *Regulatory Notice*: Bike-based commercial food carriage in Tamil Nadu requires verified commercial transport permits and carrier authorization. The integration is safely disabled until the store owner verifies compliance.
- **Authentic Tracking**: Displays real rider reference numbers and external tracking links assigned by the shop; never displays fake live GPS tracking animations.

### 3. Secure Admin Command Center (`/admin`)
- **Authentication**: PIN-protected access (Default demo PIN: `mirchi123`).
- **Live Orders Board**: Real-time status transitions (`Placed` → `Accepted` → `Preparing` → `Ready for Pickup` → `Out for Delivery` → `Delivered` / `Cancelled`).
- **Product & Price Management**: Add new dishes, edit prices, toggle availability (*In Stock* vs *Sold Out*), and verify seed data items with `Needs Review` approval badges.
- **Promotions & Offers**: Create and manage percentage or flat-rate discount codes with minimum order limits and maximum discount caps.
- **Delivery Zone Controls**: Set maximum delivery radius (km), base delivery fee, free delivery threshold, and assign carriers.
- **Analytics & Unit Economics**: Daily order count, gross revenue, average order value (AOV), variable food cost estimates (40%), and gross contribution margin.
- **Export Data**: One-click CSV export of all customer orders.

---

## 🛠️ Tech Stack & Architecture

- **Frontend & Backend**: Next.js 16.4.3 (App Router, Turbopack, React 19)
- **Styling**: Tailwind CSS v4, custom glassmorphism utilities, warm street-food color tokens
- **Typography & Icons**: Google Outfit font, Lucide React icons
- **Data Layer**:
  - `prisma/schema.prisma`: Comprehensive PostgreSQL schema with models for Users, Categories, Products, Orders, OrderItems, Payments, Promos, and StoreSettings.
  - Persistent repository layer (`src/lib/data/store.ts`): File-backed zero-configuration persistence for instant local development and test execution.
- **Automated Test Suite**: Vitest 5 with automated test suites for pricing engine, stock checks, order lifecycle, and REST APIs.

---

## 🚀 Quick Start & Local Development

### 1. Prerequisites
- Node.js v20+ (tested on Node v26)
- npm v10+

### 2. Installation
```bash
# Clone or navigate to the directory
cd d:/mc

# Install dependencies (already completed)
npm install
```

### 3. Running Automated Tests
```bash
npm test
```
Runs 15 automated unit and integration tests covering:
- Cart subtotal and customization add-on calculations
- Free delivery threshold and tiered distance calculations
- Promo code application with percentage and flat caps
- Order creation, stock availability validation, and status transitions
- Server-side REST API handlers (`/api/menu`, `/api/promos/validate`, `/api/orders`)

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser:
- Customer Storefront: [http://localhost:3000](http://localhost:3000)
- Admin Command Center: [http://localhost:3000/admin](http://localhost:3000/admin) (PIN: `mirchi123`)

### 5. Production Build
```bash
npm run build
npm start
```

---

## 📋 Integration & Production Deployment Checklist

The following items should be configured prior to production launch:

| Integration / Requirement | Status | Production Action Required |
| :--- | :--- | :--- |
| **Razorpay Payment Gateway** | Sandbox / Direct COD Ready | Create a live merchant account at [Razorpay Dashboard](https://dashboard.razorpay.com), obtain `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`, and set `ENABLE_MOCK_PAYMENT="false"`. |
| **PostgreSQL Database** | SQLite / JSON Persistent (Dev) | Point `DATABASE_URL` in `.env.local` to a hosted PostgreSQL instance (e.g., Supabase, Neon, AWS RDS) and run `npx prisma db push`. |
| **Dunzo / Porter Courier APIs** | Modular Adapter Ready | Complete corporate onboarding with Dunzo for Business / Porter Enterprise to generate client credentials. |
| **Tamil Nadu Bike Delivery Transport** | Kept Disabled | Verify state transport department regulations regarding commercial vehicle permits before enabling 2-wheeler commercial logistics. |
| **Admin Secret PIN** | `mirchi123` (Demo) | Update `ADMIN_SECRET_KEY` in `.env.local` and configure session cookie signing for production. |
| **Menu Prices & Seed Data** | Marked for Admin Review | Review initial prices and descriptions via the `/admin` Menu tab to confirm or update store pricing. |

---

## 📍 Store Information
- **Store Name**: Mirchi Chaats
- **Address**: Vysial Street, Town Hall, Coimbatore, Tamil Nadu 641001
- **Phone**: 9994147744 / 9597400881
- **Hours**: Open Daily 3:00 PM – 10:30 PM
- **Cuisine**: 100% Pure Vegetarian Street Chaats, Pav Bhaji, Mocktails
