# Tiketin Product Roadmap & Issues Specification

This document details the top 8 priority features required for production scale-up of the **Tiketin** platform.

---

## Issue 1: [FEAT] Midtrans & Xendit Production Payment Gateway Integration

- **Labels**: `enhancement`, `payments`, `high-priority`
- **Priority**: P0 (Critical)
- **Target App**: `apps/api`, `apps/web`

### User Story
As a ticket buyer, I want to pay for my tickets using local payment channels (QRIS, GoPay, ShopeePay, Virtual Accounts, Credit Card) so that I can complete my purchase seamlessly.

### Technical Specification
- Implement Payment Gateway Provider strategy pattern (`MidtransService`, `XenditService`).
- Integrate webhook handler at `POST /payments/webhook/:provider` with signature verification.
- Implement idempotency checks to prevent duplicate order status updates.
- Store raw payment payload in `Payment.rawPayload`.

### Implementation Checklist
- [ ] Create `MidtransProvider` and `XenditProvider` extending abstract `PaymentProvider`.
- [ ] Add `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `XENDIT_API_KEY` to environment variables.
- [ ] Implement webhook endpoint `POST /payments/webhook/midtrans` with IP / signature validation.
- [ ] Update Web frontend checkout page to display Midtrans Snap popup or Xendit redirect iframe.
- [ ] Write integration unit tests for webhook success and failure callbacks.

### Acceptance Criteria
- [ ] Payment status transitions automatically from `INITIATED` -> `PAID` upon valid webhook notification.
- [ ] Expired payment notifications mark order status as `EXPIRED` and release reserved stock.
- [ ] Invalid webhook signatures return HTTP 403 Forbidden.

---

## Issue 2: [FEAT] Dynamic Seat Map & Reserved Seating Engine

- **Labels**: `enhancement`, `feature`, `organizer`, `web`
- **Priority**: P1 (High)
- **Target App**: `apps/api`, `packages/db`, `apps/organizer`, `apps/web`

### User Story
As an event organizer, I want to create seated venue layouts (sections, rows, seat numbers) so that attendees can pick their specific seats during checkout.

### Technical Specification
- Add `VenueLayout`, `SeatSection`, `Seat` models to `schema.prisma`.
- Implement 10-minute temporary seat locking mechanism using Redis key expiry (`seat:lock:{seatId}`).
- Render interactive SVG/Canvas seat map component in `apps/web`.

### Implementation Checklist
- [ ] Update Prisma schema with `VenueLayout`, `Seat`, `TicketSeat` models and run migration.
- [ ] Create API endpoints: `GET /events/:id/seats`, `POST /events/:id/seats/lock`, `DELETE /events/:id/seats/lock`.
- [ ] Build visual seat map editor in `apps/organizer` for layout configuration.
- [ ] Integrate seat selection modal in `apps/web` checkout flow.
- [ ] Ensure seat release on order expiration or cancellation.

### Acceptance Criteria
- [ ] Locked seats cannot be selected by other concurrent users during the 10-minute window.
- [ ] Issued ticket records contain assigned seat section, row, and seat number.

---

## Issue 3: [FEAT] Offline-First PWA QR Scanner with Background Sync

- **Labels**: `enhancement`, `scanner`, `pwa`, `offline`
- **Priority**: P1 (High)
- **Target App**: `apps/organizer`

### User Story
As an on-site event staff member, I want the QR scanner to work reliably even when venue internet connectivity is spotty or disconnected.

### Technical Specification
- Implement Service Worker and IndexedDB queue (`idb`) in `apps/organizer`.
- Cache offline event guest list hash and local public keys for offline cryptographic validation.
- Sync offline check-in logs via Background Sync API once connection is restored.

### Implementation Checklist
- [ ] Configure `next-pwa` in `apps/organizer`.
- [ ] Add IndexedDB storage strategy for scanned ticket buffer.
- [ ] Implement local HMAC verification fallback when offline.
- [ ] Build sync indicator banner in scanner UI showing pending offline check-in count.
- [ ] Add conflict resolution strategy for duplicate offline check-ins.

### Acceptance Criteria
- [ ] Staff can scan tickets uninterrupted without network connectivity.
- [ ] Pending check-ins automatically sync to `apps/api` upon network reconnection.

---

## Issue 4: [FEAT] Automated Payout & Financial Ledger System

- **Labels**: `enhancement`, `finance`, `admin`, `organizer`
- **Priority**: P1 (High)
- **Target App**: `apps/api`, `apps/admin`, `apps/organizer`

### User Story
As an event organizer, I want to view my net earnings and request automated payouts to my bank account.

### Technical Specification
- Add `Payout`, `OrganizerBankAccount`, `PlatformLedger` models to Prisma schema.
- Calculate Net Balance = Total Revenue - (3% Platform Fee + Gateway Fees).
- Build Payout approval workflow in `apps/admin`.

### Implementation Checklist
- [ ] Create database models for `OrganizerBankAccount` and `Payout`.
- [ ] Add API routes for payout request `POST /organizers/payouts` and admin approval `POST /admin/payouts/:id/approve`.
- [ ] Implement bank account verification flow (Xendit Disbursement / Midtrans Iris API).
- [ ] Build financial summary dashboard in `apps/organizer` with downloadable PDF reports.

### Acceptance Criteria
- [ ] Organizers cannot request payouts exceeding their available net balance.
- [ ] Admin approval triggers payout status update and logs transaction in platform audit logs.

---

## Issue 5: [FEAT] Promotional Voucher & Discount Engine

- **Labels**: `enhancement`, `feature`, `marketing`
- **Priority**: P2 (Medium)
- **Target App**: `apps/api`, `apps/organizer`, `apps/web`

### User Story
As an organizer, I want to issue discount promo codes (percentage or fixed amount) to boost early-bird ticket sales.

### Technical Specification
- Create `Voucher` model with fields `code`, `discountType` (`PERCENTAGE` / `FIXED`), `discountValue`, `minOrderAmount`, `maxRedemptions`, `startAt`, `expiresAt`.
- Validate voucher applicability during checkout calculation in `OrdersService`.

### Implementation Checklist
- [ ] Define `Voucher` and `VoucherRedemption` Prisma models.
- [ ] Add CRUD endpoints in `apps/api` under `OrganizersVouchersController`.
- [ ] Add promo code input field on `apps/web` checkout page with live discount calculation.
- [ ] Enforce usage limits per user email and global max redemptions.

### Acceptance Criteria
- [ ] Expired or exhausted vouchers produce a clear validation error.
- [ ] Order subtotal, discount amount, platform fee, and final total calculate accurately.

---

## Issue 6: [FEAT] Real-Time Event Analytics & Sales Dashboard

- **Labels**: `enhancement`, `analytics`, `organizer`
- **Priority**: P2 (Medium)
- **Target App**: `apps/organizer`, `apps/api`

### User Story
As an event organizer, I want to view real-time graphs of ticket sales velocity and check-in rates so that I can optimize event operations.

### Technical Specification
- Aggregate sales trends by hour/day using PostgreSQL date trunc queries.
- Serve analytics via WebSocket / Server-Sent Events (SSE) or cached REST endpoint.
- Render charts using Recharts / Chart.js in `apps/organizer`.

### Implementation Checklist
- [ ] Implement `GET /organizers/events/:id/analytics` endpoint with 5-minute Redis caching.
- [ ] Build sales speed chart, ticket tier breakdown pie chart, and check-in hourly histogram.
- [ ] Add export functionality for attendee lists (CSV/Excel).

### Acceptance Criteria
- [ ] Analytics load in < 300ms for events with over 10,000 orders.
- [ ] Attendees export includes attendee full name, email, ticket code, and check-in timestamp.

---

## Issue 7: [FEAT] Apple Wallet & Google Wallet Pass Integration

- **Labels**: `enhancement`, `mobile`, `user-experience`
- **Priority**: P2 (Medium)
- **Target App**: `apps/api`, `apps/web`

### User Story
As a ticket buyer, I want to add my event ticket to my Apple Wallet or Google Pay Wallet so I can easily access it at the event gate without opening an email.

### Technical Specification
- Generate `.pkpass` files using `passkit-generator` (Apple Wallet API).
- Create Google Wallet Pass JWT objects using Google Wallet API.
- Add "Add to Apple Wallet" and "Add to Google Wallet" buttons on order success page and email notifications.

### Implementation Checklist
- [ ] Set up Apple Developer Pass Certificate & Google Wallet Merchant Account.
- [ ] Implement `GET /tickets/:ticketCode/apple-pass` returning `application/vnd.apple.pkpass`.
- [ ] Implement `GET /tickets/:ticketCode/google-pass` returning Google Wallet save URL.
- [ ] Render pass action buttons on `apps/web` order summary page.

### Acceptance Criteria
- [ ] Scannable encrypted QR code is displayed prominently inside Apple & Google Wallet passes.
- [ ] Pass updates automatically if event date or venue changes.

---

## Issue 8: [FEAT] Multi-Language (i18n) & Multi-Currency Support

- **Labels**: `enhancement`, `i18n`, `globalization`
- **Priority**: P3 (Low)
- **Target App**: `apps/web`, `apps/organizer`, `apps/api`

### User Story
As an international event attendee or organizer, I want to view the platform in English or Indonesian and purchase tickets in foreign currencies (USD, SGD, IDR).

### Technical Specification
- Integrate `next-intl` or `react-i18next` across `apps/web` and `apps/organizer`.
- Add currency exchange rate conversion service in `apps/api`.

### Implementation Checklist
- [ ] Create translation dictionaries (`en.json`, `id.json`).
- [ ] Add language selector in header and footer.
- [ ] Update Prisma `TicketType` and `Order` models to support dynamic currency conversion rates.

### Acceptance Criteria
- [ ] Users can seamlessly toggle between Indonesian and English without losing session state.
- [ ] Ticket prices format correctly according to selected locale currency formatting rules.
