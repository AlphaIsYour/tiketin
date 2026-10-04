# Tiketin

> **Modern, White-Label B2B2C Event Ticketing & Gate Check-in Platform**  
> *Scalable monorepo solution powered by NestJS, Next.js 14, PostgreSQL, Prisma ORM, and Turborepo.*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.x-E0234E.svg?logo=nestjs)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.x-black.svg?logo=next.js)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748.svg?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.x-4169E1.svg?logo=postgresql)](https://www.postgresql.org/)
[![pnpm](https://img.shields.io/badge/pnpm-11.x-F69220.svg?logo=pnpm)](https://pnpm.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📌 Architecture Overview

Tiketin is designed as a high-throughput, multi-tenant event ticketing platform. It partitions responsibility into three specialized frontend domains and a unified REST API service:

```mermaid
graph TD
    subgraph Clients ["Frontend Portals (Next.js 14 App Router)"]
        WEB["apps/web (Port 3000)<br/>Public Storefront & Buyer Portal"]
        ORG["apps/organizer (Port 3001)<br/>Organizer Dashboard & QR Scanner"]
        ADM["apps/admin (Port 3002)<br/>Super-Admin Governance"]
    end

    subgraph CoreBackend ["Backend & Shared Layer"]
        API["apps/api (Port 4000)<br/>NestJS REST API Service"]
        DB[(PostgreSQL Database)]
        REDIS[(Redis Cache / Rate Limiter)]
    end

    subgraph SharedPackages ["Shared Workspace Packages"]
        PKG_CORE["@tiketin/core"]
        PKG_DB["@tiketin/db"]
        PKG_TYPES["@tiketin/types"]
        PKG_UI["@tiketin/ui"]
    end

    WEB -->|HTTP / JSON| API
    ORG -->|HTTP / JSON| API
    ADM -->|HTTP / JSON| API

    API --> DB
    API --> REDIS

    WEB .-> PKG_UI
    ORG .-> PKG_UI
    ADM .-> PKG_UI
    API .-> PKG_CORE
    API .-> PKG_DB
    API .-> PKG_TYPES
```

---

## 🔄 End-to-End Ticket Lifecycle & Order Flow

```mermaid
sequenceDiagram
    autonumber
    actor Buyer as Ticket Buyer
    participant Web as apps/web
    participant API as apps/api (NestJS)
    participant DB as PostgreSQL (Prisma)
    actor Staff as Organizer Staff
    participant Scanner as apps/organizer (Scanner)

    Buyer->>Web: Select Event & Ticket Type
    Web->>API: POST /orders (Create Order)
    API->>DB: Atomic stock decrement & Order reservation (TTL: 15m)
    API-->>Web: Order created + Checkout Details
    Buyer->>Web: Submit Payment Simulation / Gateway
    Web->>API: POST /payments/simulate (or Webhook)
    API->>DB: Order STATUS -> PAID, Generate Unique Cryptographic QR Tokens
    API->>DB: Issue Ticket Records (Status: ISSUED)
    API-->>Buyer: Send Email Confirmation & PDF Ticket
    
    Note over Buyer,Staff: Event Day On-Site Entry
    Buyer->>Staff: Present Encrypted QR Code
    Staff->>Scanner: Scan QR Code via Camera
    Scanner->>API: POST /check-ins/scan
    API->>DB: Verify HMAC Signature & Change Status to USED
    API-->>Scanner: Return Verification Result (SUCCESS / ALREADY_USED)
```

---

## 🛠️ Technical Documentation & Guides

<details>
<summary><b>1. Quickstart & Local Setup Guide</b></summary>

### Prerequisites
- **Node.js**: `v20.x` or higher
- **Package Manager**: `pnpm v11.x` (`corepack enable pnpm`)
- **Database**: PostgreSQL database instance

### Step-by-Step Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-org/tiketin.git
   cd tiketin
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` in the root and in individual app directories.

4. **Synchronize Database Schema**:
   ```bash
   pnpm db:push
   ```

5. **Seed Dummy Data (Optional)**:
   ```bash
   pnpm --filter api seed:dummy
   ```

6. **Start All Services in Parallel**:
   ```bash
   pnpm dev
   ```

| Application | Port | Default URL | Default Credentials |
| :--- | :--- | :--- | :--- |
| **Buyer Portal (`apps/web`)** | `3000` | http://localhost:3000 | `buyer@tiketin.id` / `ChangeMe123!` |
| **Organizer Portal (`apps/organizer`)** | `3001` | http://localhost:3001 | `organizer@tiketin.id` / `ChangeMe123!` |
| **Admin Portal (`apps/admin`)** | `3002` | http://localhost:3002 | `admin@tiketin.id` / `ChangeMe123!` |
| **Backend REST API (`apps/api`)** | `4000` | http://localhost:4000 | N/A |

</details>

<details>
<summary><b>2. Environment Variable Specifications</b></summary>

### Core API (`apps/api/.env`)
```env
PORT=4000
DATABASE_URL="postgresql://user:password@localhost:5432/tiketin_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
QR_SECRET="cryptographic-qr-signing-secret"
APP_WEB_URL="http://localhost:3000"
RESEND_API_KEY="re_123456789"
REDIS_URL="redis://localhost:6379" # Optional rate-limiting adapter
```

### Web Storefront (`apps/web/.env.local`)
```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

### Organizer Dashboard (`apps/organizer/.env.local`)
```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

### Admin Portal (`apps/admin/.env.local`)
```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

</details>

<details>
<summary><b>3. Repository & Directory Structure</b></summary>

```
tiketin/
├── apps/
│   ├── admin/             # Next.js 14 Platform Governance Portal
│   ├── api/               # NestJS Core REST API Server
│   ├── organizer/         # Next.js 14 Organizer Dashboard & Scanner
│   └── web/               # Next.js 14 E-commerce Buyer Storefront
├── packages/
│   ├── auth/              # Shared authentication utilities & types
│   ├── core/              # Cryptographic QR helpers, token generators
│   ├── db/                # Prisma ORM schema & migrations
│   ├── types/             # Shared TypeScript DTOs & API interfaces
│   └── ui/                # Shared Tailwind design system components
├── pnpm-workspace.yaml    # Workspace package configuration
└── package.json           # Root scripts & dev engines
```

</details>

<details>
<summary><b>4. State Machines & Status Transitions</b></summary>

### Order Lifecycle State Machine
```
[PENDING] ---> (Payment Received) -------> [PAID]
   |
   +---------> (15-min TTL Expired) ----> [EXPIRED]
   |
   +---------> (User Cancelled) --------> [CANCELLED]
   |
   +---------> (Gateway Failed) ---------> [FAILED]
```

### Ticket Status Lifecycle
```
[ISSUED] ----> (On-site QR Scanned) ----> [USED]
   |
   +---------> (Order Refunded) --------> [REFUNDED]
   |
   +---------> (Security Invalidation) -> [INVALIDATED]
```

</details>

<details>
<summary><b>5. Security & Compliance Safeguards</b></summary>

- **Cryptographic QR Validation**: QR tokens embed an HMAC-SHA256 signature calculated from ticket metadata and `QR_SECRET` to prevent token forging or screenshot duplication.
- **Race-Condition Stock Guard**: Order creation executes inside Prisma database transactions with atomic stock decrement checks (`stockSold + quantity <= stockTotal`).
- **Throttling & DDoS Protection**: NestJS Throttler guards limit requests per IP/user across public endpoints (`POST /orders`, `/auth/login`).
- **Role-Based Access Control (RBAC)**: Strict role hierarchy enforcement across Platform Roles (`ADMIN`, `USER`) and Organizer Member Roles (`OWNER`, `MANAGER`, `STAFF`, `SCANNER`).
</details>

---

## 📜 License

This project is distributed under the **MIT License**. See `LICENSE` for details.
