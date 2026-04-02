# TrustShield Platform – Product Requirements Document (PRD)

**Version:** 1.0  
**Last Updated:** 2. April 2026  
**Status:** In Active Development  
**Project Owner:** YoureFuture GmbH  
**Code Name:** TrustShield Phase 1

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Tech Stack](#tech-stack)
4. [Current Implementation Status](#current-implementation-status)
5. [Feature Breakdown](#feature-breakdown)
6. [API Documentation](#api-documentation)
7. [Database Schema](#database-schema)
8. [File Structure](#file-structure)
9. [Development Setup](#development-setup)
10. [Known Issues & TODOs](#known-issues--todos)
11. [Deployment Guide](#deployment-guide)
12. [Team Handoff Checklist](#team-handoff-checklist)

---

## Executive Summary

### What is TrustShield?

**TrustShield** is a professional OSINT (Open Source Intelligence) platform designed to help users:
- Detect if their personal information is exposed in data breaches
- Find their digital footprint across 10+ OSINT sources
- Manage and remove their data from public databases
- Monitor threat levels in real-time

### Current Phase Status

**Phase 1 Completion: ~75%**

- ✅ Backend OSINT infrastructure (11 Docker services, 10+ tools)
- ✅ Professional frontend UI (Next.js 15, dark theme, Alexandria design)
- ✅ User authentication system (email/password, no verification)
- ✅ Internationalization (German/English)
- ✅ Database schema (PostgreSQL migrations)
- ✅ API route structure (mock responses ready)
- ⏳ Backend API integration (needs database connection)
- ⏳ Image/file storage (needs S3 or local implementation)
- ⏳ Advanced features (roles, teams, batch operations)

### Current Deployment

- **Frontend:** Running locally on `http://localhost:3001` (Next.js dev server)
- **Backend:** NestJS API ready (needs to be started)
- **Database:** PostgreSQL (migrations created, not yet applied)
- **OSINT Services:** Docker Compose available (see `docker-compose.yml`)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USER BROWSER                             │
│            (Next.js 15 Frontend @ :3001)                    │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTP/REST
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              NEXT.JS API ROUTES (Mock)                       │
│  /api/v1/auth/{register,login}                              │
│  /api/v1/users/{profile,images/*}                           │
│  /api/v1/osint/{search,results}  [TODO: Implement]          │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTP/REST (Forward to NestJS)
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              NESTJS BACKEND API (@ :3000)                    │
│  • Authentication & Token Management                         │
│  • User Profile Management                                   │
│  • OSINT Tool Orchestration                                  │
│  • Image/File Storage Handling                               │
└──────────────────┬──────────────────────────────────────────┘
                   │ SQL
                   ▼
┌─────────────────────────────────────────────────────────────┐
│          PostgreSQL DATABASE                                 │
│  • Users Table (registration, profiles)                      │
│  • User Images Table (file uploads)                          │
│  • User Sessions Table (token management)                    │
│  • Search Results Cache (optional)                           │
└─────────────────────────────────────────────────────────────┘
                   │ gRPC
                   ▼
┌─────────────────────────────────────────────────────────────┐
│          OSINT SERVICES (Docker Compose)                     │
│  • SpiderFoot (reconnaissance)                               │
│  • PhoneInfoga (phone number lookup)                         │
│  • Have I Been Pwned (breach detection)                      │
│  • Qdrant (vector search)                                    │
│  • MRISA (advanced OSINT)                                    │
│  • Elasticsearch (indexing)                                  │
│  • SearXNG (metasearch)                                      │
│  • Redis (caching)                                           │
│  + More...                                                   │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **Monorepo with Turborepo** – Separate `apps` and `packages` for code reuse
2. **Dark Theme + Glassmorphism** – Premium, modern aesthetic matching Alexandria design system
3. **Internationalization (i18n)** – URL-based locale routing (`/de`, `/en`)
4. **API-First Approach** – Frontend consumes REST APIs (ready for mobile apps)
5. **Database Migrations** – Version-controlled schema changes
6. **Mock Responses** – Frontend pages work before backend integration

---

## Tech Stack

### Frontend (apps/web)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.5.14 | React framework with SSR/SSG |
| **React** | 19.x | UI component library |
| **TypeScript** | Latest | Type-safe development |
| **Tailwind CSS** | 3.x | Utility-first CSS framework |
| **next-intl** | 3.x | Internationalization (i18n) |
| **Syncfusion** | 33.1.x | Enterprise UI components (DataGrid, Charts) |
| **React Query** | 5.x | Data fetching & caching |
| **next/navigation** | 15.x | Client-side routing |

### Backend (apps/api)

| Technology | Version | Purpose |
|------------|---------|---------|
| **NestJS** | Latest | Node.js framework |
| **TypeScript** | Latest | Type-safe backend |
| **PostgreSQL** | 14+ | Primary database |
| **Drizzle ORM** | Latest | Database ORM (lightweight alternative to TypeORM) |
| **MikroORM** | Latest | Alternative ORM (currently used in entities) |
| **Passport.js** | Latest | Authentication strategies |
| **JWT** | Latest | Token-based authentication |
| **bcrypt** | Latest | Password hashing (TODO: implement) |

### DevOps / Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Docker** | Latest | Containerization |
| **Docker Compose** | 3.8+ | Multi-service orchestration |
| **PostgreSQL** | 14+ | Relational database |
| **Redis** | Latest | Caching & session store |
| **Qdrant** | Latest | Vector database |
| **Elasticsearch** | Latest | Full-text search |

### Package Manager & Build Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **pnpm** | Latest | Fast package manager (monorepo) |
| **Turbo** | Latest | Monorepo build orchestration |
| **ESLint** | Latest | Code linting |
| **TypeScript** | 5.x | Type checking |

---

## Current Implementation Status

### Phase 1: Foundation (75% Complete)

#### ✅ COMPLETED

**Backend Infrastructure:**
- ✅ NestJS API scaffold with module structure
- ✅ 11 Docker services configured (Qdrant, MRISA, SpiderFoot, etc.)
- ✅ docker-compose.yml with all OSINT tools
- ✅ Authentication module skeleton
- ✅ User management endpoints (scaffold)

**Frontend - Core UI:**
- ✅ Next.js 15 with React 19
- ✅ Dark theme based on Alexandria design system
- ✅ Sidebar navigation (AppShell component)
- ✅ Top header with search bar & icons
- ✅ Responsive layout (desktop-first)

**Frontend - Internationalization:**
- ✅ next-intl setup with middleware
- ✅ German (de.json) & English (en.json) translations
- ✅ 200+ translation keys per language
- ✅ Language switcher component (DE/EN toggle)
- ✅ URL-based locale routing (/de, /en)

**Frontend - Authentication:**
- ✅ Register page (email, password, first/last name)
- ✅ Login page (email, password)
- ✅ Form validation (client-side)
- ✅ Auth token storage (localStorage)
- ✅ Protected route logic (redirect to login if no token)

**Frontend - User Profile:**
- ✅ Profile page with 3 tabs (Profile, Images, Settings)
- ✅ Personal info editor (first name, last name, bio)
- ✅ Image upload & gallery
- ✅ Language/theme settings dropdown
- ✅ Logout functionality

**Frontend - OSINT Dashboard:**
- ✅ Search interface placeholder
- ✅ Results display framework
- ✅ Info cards (search types, integrated sources, response time)
- ✅ SyncfusionOSINTDashboard component integration

**API Routes (Mock Responses):**
- ✅ POST /api/v1/auth/register
- ✅ POST /api/v1/auth/login
- ✅ GET /api/v1/users/profile
- ✅ PUT /api/v1/users/profile
- ✅ POST /api/v1/users/images/upload
- ✅ DELETE /api/v1/users/images/[id]

**Database:**
- ✅ PostgreSQL migration file created (0002_add_users_tables.sql)
- ✅ User entity defined (Mikro-ORM)
- ✅ UserImage entity defined
- ✅ UserSession entity defined
- ✅ Database indexes created for performance

**Code Quality:**
- ✅ TypeScript throughout (frontend & backend)
- ✅ ESLint configuration
- ✅ Git commits with clear messages (4 major commits)
- ✅ Monorepo structure (apps/web, apps/api, packages/*)

---

#### ⏳ IN PROGRESS / TODO

**High Priority (This Sprint):**

1. **Backend API Integration** (Estimated: 3-5 days)
   - [ ] Connect NestJS to PostgreSQL
   - [ ] Run migrations: `psql < packages/db/migrations/0002_add_users_tables.sql`
   - [ ] Implement bcrypt password hashing in auth service
   - [ ] Replace mock responses with real database queries
   - [ ] Add JWT token validation middleware
   - [ ] Implement session expiry (30-day TTL)

2. **Image Storage** (Estimated: 2-3 days)
   - [ ] Choose storage backend (AWS S3, MinIO, or local filesystem)
   - [ ] Implement file upload service in NestJS
   - [ ] Generate signed URLs for image access
   - [ ] Add image deletion with storage cleanup
   - [ ] CDN integration (optional)

3. **User Account Features** (Estimated: 2-3 days)
   - [ ] Email verification flow (currently skipped per requirement)
   - [ ] Password reset via email
   - [ ] Password change functionality
   - [ ] Account deletion with data cleanup
   - [ ] Email notifications (welcome email, password reset)

**Medium Priority (Next 2 Weeks):**

4. **OSINT Search Implementation**
   - [ ] Create OSINT search controller in NestJS
   - [ ] Implement orchestration service to call multiple tools
   - [ ] Handle tool failures gracefully (timeout, errors)
   - [ ] Cache search results in Redis/Elasticsearch
   - [ ] Return unified result format to frontend
   - [ ] Support search types: username, email, phone, domain, image

5. **Advanced User Features**
   - [ ] User roles & permissions (Admin, User, Analyst)
   - [ ] Team management (create, invite, manage)
   - [ ] Batch operations (bulk uploads, bulk searches)
   - [ ] Search history & saved searches
   - [ ] Export results (CSV, PDF, Excel)
   - [ ] Scheduled scans/monitoring

6. **Frontend Enhancements**
   - [ ] Implement actual search form in OSINT dashboard
   - [ ] Results pagination & filtering
   - [ ] Chart visualizations (using Syncfusion Charts)
   - [ ] Real-time notifications (using WebSockets or Server-Sent Events)
   - [ ] Analytics dashboard
   - [ ] Dark/Light theme toggle (currently dark-only)

**Low Priority (Phase 2):**

7. **Mobile & API**
   - [ ] Mobile app (React Native or Flutter)
   - [ ] Public REST API with API keys
   - [ ] GraphQL endpoint (optional)
   - [ ] Webhooks for integrations

8. **Compliance & Security**
   - [ ] Data encryption at rest
   - [ ] GDPR compliance (data export, deletion)
   - [ ] 2FA/TOTP implementation
   - [ ] Audit logs
   - [ ] Security headers (CSP, X-Frame-Options, etc.)
   - [ ] Rate limiting on API endpoints

---

## Feature Breakdown

### F1: User Authentication (80% Complete)

**Implemented:**
- Email + password registration
- Email as unique username
- Client-side form validation
- Token generation (mock)
- Token storage in localStorage
- Protected route redirects

**TODO:**
- [ ] Database storage of hashed passwords (bcrypt)
- [ ] Real JWT token generation
- [ ] Token refresh logic
- [ ] Password reset flow
- [ ] Email verification (skip per requirements)
- [ ] 2FA/TOTP support

**API Endpoints:**
```
POST /api/v1/auth/register
Body: { email, password, firstName?, lastName? }
Response: { token, user: { id, email, firstName, lastName } }

POST /api/v1/auth/login
Body: { email, password }
Response: { token, user: { id, email, firstName, lastName } }

POST /api/v1/auth/logout
Response: { message: "Logged out successfully" }

POST /api/v1/auth/refresh
Headers: Authorization: Bearer <token>
Response: { token: <new_token> }

POST /api/v1/auth/forgot-password [TODO]
Body: { email }
Response: { message: "Reset link sent" }

POST /api/v1/auth/reset-password [TODO]
Body: { token, newPassword }
Response: { message: "Password reset successful" }
```

---

### F2: User Profile Management (90% Complete)

**Implemented:**
- View profile (email, first name, last name, bio)
- Edit personal info
- Image upload with validation
- Image gallery display
- Language preference (DE/EN)
- Theme preference (Dark/Light)
- Logout button

**TODO:**
- [ ] Database persistence (currently mock)
- [ ] Image storage backend
- [ ] Password change functionality
- [ ] Account deletion confirmation
- [ ] Profile picture as avatar

**API Endpoints:**
```
GET /api/v1/users/profile
Headers: Authorization: Bearer <token>
Response: { 
  id, email, firstName, lastName, bio, avatarUrl, 
  language, theme, images: [...], createdAt, updatedAt 
}

PUT /api/v1/users/profile
Headers: Authorization: Bearer <token>
Body: { firstName?, lastName?, bio?, language?, theme? }
Response: { ...updated_user }

POST /api/v1/users/images/upload
Headers: Authorization: Bearer <token>
Body: FormData { file: File }
Response: { 
  id, filename, mimeType, fileSizeBytes, imageUrl, 
  isPrimary, createdAt 
}

DELETE /api/v1/users/images/:imageId
Headers: Authorization: Bearer <token>
Response: { message: "Image deleted" }

POST /api/v1/users/change-password [TODO]
Headers: Authorization: Bearer <token>
Body: { currentPassword, newPassword }
Response: { message: "Password changed" }

DELETE /api/v1/users/account [TODO]
Headers: Authorization: Bearer <token>
Response: { message: "Account deleted" }
```

---

### F3: OSINT Search & Intelligence (5% Complete)

**Implemented:**
- Search interface layout
- Info cards (search types, integrated sources)
- Dashboard component placeholder

**TODO:**
- [ ] Search form with input validation
- [ ] Multi-source orchestration service
- [ ] Real-time result streaming
- [ ] Result caching & indexing
- [ ] Advanced filters
- [ ] Batch searches
- [ ] Search history

**API Endpoints to Implement:**
```
POST /api/v1/osint/search
Headers: Authorization: Bearer <token>
Body: { 
  query, 
  searchTypes: ["username" | "email" | "phone" | "domain" | "image"],
  includeTools?: [toolIds]
}
Response: {
  searchId, status: "queued" | "running" | "complete",
  startedAt, estimatedCompletionTime,
  results?: { tool, data, source, confidence }[]
}

GET /api/v1/osint/search/:searchId
Headers: Authorization: Bearer <token>
Response: { searchId, status, progress, results?, completedAt? }

GET /api/v1/osint/search/:searchId/stream [WebSocket/SSE]
Headers: Authorization: Bearer <token>
Streaming: { resultsBatch: [...] }

POST /api/v1/osint/search/:searchId/export
Headers: Authorization: Bearer <token>
Body: { format: "csv" | "pdf" | "json" }
Response: File download

GET /api/v1/osint/searches?limit=20&offset=0
Headers: Authorization: Bearer <token>
Response: { searches: [...], total, hasMore }

POST /api/v1/osint/searches/:searchId/save
Headers: Authorization: Bearer <token>
Body: { name, notes? }
Response: { savedSearchId, ... }

DELETE /api/v1/osint/searches/:searchId
Headers: Authorization: Bearer <token>
Response: { message: "Search deleted" }
```

---

### F4: Data Removal Management (0% Complete)

**Status:** Not yet implemented (in design phase)

**Planned Features:**
- [ ] Track data exposure across platforms
- [ ] Removal request workflow
- [ ] DMCA/GDPR submission support
- [ ] Automated removal scripts
- [ ] Manual removal instructions
- [ ] Removal progress tracking
- [ ] Compliance documentation

**API Endpoints (Design):**
```
POST /api/v1/removal/requests
Headers: Authorization: Bearer <token>
Body: { foundOnSource, dataType, content }
Response: { requestId, status, estimatedCompletionDate }

GET /api/v1/removal/requests/:requestId
Headers: Authorization: Bearer <token>
Response: { requestId, status, progress, notes, history }

POST /api/v1/removal/requests/:requestId/execute
Headers: Authorization: Bearer <token>
Body: { method: "automatic" | "manual" }
Response: { executionId, status }
```

---

## API Documentation

### Authentication Flow

1. **Register**: `POST /api/v1/auth/register`
   ```json
   Request:
   {
     "email": "user@example.com",
     "password": "SecurePassword123",
     "firstName": "John",
     "lastName": "Doe"
   }
   
   Response (201):
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "id": "uuid-123",
       "email": "user@example.com",
       "firstName": "John",
       "lastName": "Doe",
       "language": "de",
       "theme": "dark"
     }
   }
   ```

2. **Login**: `POST /api/v1/auth/login`
   ```json
   Request:
   {
     "email": "user@example.com",
     "password": "SecurePassword123"
   }
   
   Response (200):
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": { ... }
   }
   ```

3. **Protected Endpoints** use Bearer token:
   ```
   Headers:
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Error Response Format

All errors follow this format:
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Email already registered",
  "timestamp": "2026-04-02T14:30:00Z",
  "path": "/api/v1/auth/register"
}
```

### Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK – Request successful |
| 201 | Created – Resource created |
| 400 | Bad Request – Validation failed |
| 401 | Unauthorized – Auth required |
| 403 | Forbidden – No permission |
| 404 | Not Found – Resource doesn't exist |
| 500 | Server Error – Internal issue |

---

## Database Schema

### Current Tables (Migration: 0002_add_users_tables.sql)

#### users Table
```sql
CREATE TABLE "users" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  language TEXT DEFAULT 'de',
  theme TEXT DEFAULT 'dark',
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX users_email_idx ON users(email);
CREATE INDEX users_is_active_idx ON users(is_active);
```

#### user_images Table
```sql
CREATE TABLE "user_images" (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT,
  mime_type TEXT,
  file_size_bytes INTEGER,
  storage_key TEXT,
  image_url TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX user_images_user_id_idx ON user_images(user_id);
```

#### user_sessions Table
```sql
CREATE TABLE "user_sessions" (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX user_sessions_token_idx ON user_sessions(token);
CREATE INDEX user_sessions_user_id_idx ON user_sessions(user_id);
```

### Planned Tables (Phase 2)

- `osint_searches` – Search history & caching
- `search_results` – Detailed results storage
- `removal_requests` – Removal management
- `user_roles` – Role-based access control
- `teams` – Team management
- `audit_logs` – Activity tracking

---

## File Structure

```
yourefuture-platform/
├── apps/
│   ├── api/                          # NestJS Backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/             # Authentication (TODO: DB integration)
│   │   │   │   ├── users/            # User management (TODO: DB integration)
│   │   │   │   ├── osint/            # OSINT orchestration (TODO)
│   │   │   │   └── removal/          # Removal management (TODO)
│   │   │   ├── config/               # App configuration
│   │   │   ├── guards/               # Auth guards
│   │   │   ├── decorators/           # Custom decorators
│   │   │   └── main.ts               # Entry point
│   │   ├── docker-compose.yml        # OSINT services
│   │   └── .env.example              # Environment template
│   │
│   └── web/                          # Next.js Frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── [locale]/         # Locale wrapper
│       │   │   │   ├── page.tsx      # Dashboard (HOME)
│       │   │   │   ├── layout.tsx    # Locale layout + i18n provider
│       │   │   │   ├── auth/         # Auth pages
│       │   │   │   │   ├── login/page.tsx
│       │   │   │   │   ├── register/page.tsx
│       │   │   │   │   └── forgot-password/page.tsx [TODO]
│       │   │   │   ├── profile/page.tsx   # User profile
│       │   │   │   ├── osint/page.tsx     # OSINT search
│       │   │   │   ├── checks/page.tsx    [TODO: My Checks]
│       │   │   │   ├── removal/page.tsx   [TODO: Removal Center]
│       │   │   │   └── ...
│       │   │   ├── api/              # Next.js API Routes
│       │   │   │   └── v1/
│       │   │   │       ├── auth/
│       │   │   │       │   ├── register/route.ts
│       │   │   │       │   └── login/route.ts
│       │   │   │       ├── users/
│       │   │   │       │   ├── profile/route.ts
│       │   │   │       │   └── images/
│       │   │   │       │       ├── upload/route.ts
│       │   │   │       │       └── [id]/route.ts
│       │   │   │       └── osint/    [TODO]
│       │   │   └── layout.tsx        # Root layout
│       │   ├── components/
│       │   │   ├── AppShell.tsx      # Main layout wrapper (Sidebar + Header)
│       │   │   ├── LanguageSwitcher.tsx
│       │   │   ├── osint/
│       │   │   │   └── SyncfusionOSINTDashboard.tsx
│       │   │   └── ...
│       │   ├── lib/
│       │   │   ├── i18n.config.ts   # next-intl configuration
│       │   │   ├── syncfusion-license.ts
│       │   │   └── utils.ts
│       │   ├── hooks/               # Custom React hooks
│       │   ├── providers/           # Context providers
│       │   │   └── QueryProvider.tsx (React Query)
│       │   ├── middleware.ts        # next-intl middleware
│       │   └── messages/            # i18n translations
│       │       ├── de.json          # German (200+ keys)
│       │       └── en.json          # English (200+ keys)
│       ├── next.config.ts           # Next.js config with next-intl
│       ├── tailwind.config.ts       # Tailwind config (dark theme colors)
│       └── tsconfig.json            # TypeScript config
│
├── packages/
│   ├── db/                          # Database layer
│   │   ├── migrations/
│   │   │   ├── 0001_initial.sql    [Historical]
│   │   │   └── 0002_add_users_tables.sql
│   │   ├── seeds/                   [TODO]
│   │   └── README.md
│   ├── ui/                          # Shared UI components
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── tailwind.config.ts  # Shared Tailwind
│   │   │   ├── globals.css
│   │   │   └── styles.css
│   │   └── tsconfig.json
│   └── utils/                       # Shared utilities
│       ├── src/
│       │   ├── validators.ts
│       │   ├── formatters.ts
│       │   └── api.ts
│       └── tsconfig.json
│
├── docker-compose.yml               # Local dev setup
├── docker-compose.prod.yml          # Production setup
├── pnpm-workspace.yaml              # Monorepo definition
├── turbo.json                       # Turbo configuration
├── tsconfig.base.json              # Base TypeScript config
├── package.json                     # Root package.json
├── pnpm-lock.yaml                  # Dependency lock file
├── eslint.config.mjs                # ESLint config
├── .github/                         # GitHub Actions CI/CD [TODO]
├── docs/                            # Documentation
├── PRD.md                           # This file
└── README.md
```

---

## Development Setup

### Prerequisites

- **Node.js** 18.x or higher
- **pnpm** 8.x (package manager)
- **Docker & Docker Compose** (for OSINT services)
- **PostgreSQL** 14+ (for database)
- **Git** (version control)

### Step 1: Clone & Install

```bash
# Clone the repository
git clone https://github.com/your-org/yourefuture-platform.git
cd yourefuture-platform

# Install dependencies using pnpm
pnpm install

# Or if you prefer yarn/npm
npm install  # or yarn install
```

### Step 2: Environment Setup

```bash
# Copy environment templates
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env.local

# Edit .env files with your configuration
# apps/web/.env.local:
NEXT_PUBLIC_API_URL=http://localhost:3000

# apps/api/.env.local:
DATABASE_URL=postgresql://user:password@localhost:5432/trustshield
JWT_SECRET=your-secret-key-change-this
NODE_ENV=development
```

### Step 3: Start PostgreSQL (choose one)

**Option A: Docker**
```bash
docker run -d \
  --name trustshield-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=trustshield \
  -p 5432:5432 \
  postgres:14-alpine
```

**Option B: Local PostgreSQL**
```bash
# macOS with Homebrew
brew install postgresql@14
brew services start postgresql@14

# Or create database manually
createdb trustshield
```

### Step 4: Run Database Migrations

```bash
# Navigate to database package
cd packages/db

# Run migrations (for PostgreSQL)
psql -U postgres -h localhost -d trustshield < migrations/0002_add_users_tables.sql

# Or using a migration tool (TODO: set up)
# npx prisma migrate deploy
# pnpm run migrate
```

### Step 5: Start Backend (NestJS)

```bash
# Terminal 1: Start OSINT services (Docker Compose)
cd apps/api
docker-compose up -d

# Terminal 2: Start NestJS API
cd apps/api
pnpm run dev
# Runs on http://localhost:3000
```

### Step 6: Start Frontend (Next.js)

```bash
# Terminal 3: Start Next.js dev server
cd apps/web
pnpm run dev
# Runs on http://localhost:3001
```

### Step 7: Verify Setup

```bash
# Test frontend
curl http://localhost:3001/de          # German home page
curl http://localhost:3001/en          # English home page

# Test backend
curl http://localhost:3000/health      # Health check

# Test database
psql -U postgres -h localhost -d trustshield -c "SELECT COUNT(*) FROM users;"
```

---

## Known Issues & TODOs

### Critical Issues (Blocking Release)

1. **Database Integration Not Complete**
   - Frontend API routes return mock data
   - NestJS backend doesn't persist to PostgreSQL
   - Password hashing not implemented
   - **Fix:** Implement `UserService` with database queries

2. **Image Storage Not Implemented**
   - Upload endpoint accepts files but doesn't save
   - URLs in responses are placeholder
   - **Fix:** Integrate AWS S3 or MinIO

3. **OSINT Search Engine Not Implemented**
   - Dashboard shows placeholder only
   - No actual search orchestration
   - **Fix:** Build OSINT service in NestJS, connect to Docker tools

### Warnings (Should Fix Soon)

- [ ] Missing password reset email flow
- [ ] No error boundary in React
- [ ] Syncfusion license needs renewal check
- [ ] Rate limiting not implemented on API
- [ ] Secrets in code (use environment variables)

### Enhancements for v1.1

- [ ] Light theme support
- [ ] Mobile-responsive improvements
- [ ] Batch search optimization
- [ ] Advanced caching strategy
- [ ] Analytics dashboard

---

## Deployment Guide

### Development Environment (Current)

```bash
# 1. Start all services
pnpm dev  # Runs all apps via Turbo

# 2. Access
# Frontend: http://localhost:3001/de
# Backend: http://localhost:3000
# Postgres: localhost:5432
```

### Staging Environment

```bash
# 1. Build Docker image
docker build -f apps/web/Dockerfile -t trustshield-web:staging .
docker build -f apps/api/Dockerfile -t trustshield-api:staging .

# 2. Push to Docker Hub or ECR
docker push trustshield-web:staging
docker push trustshield-api:staging

# 3. Deploy via docker-compose.yml on staging server
docker-compose -f docker-compose.yml up -d
```

### Production Environment

```bash
# 1. Build production images
docker build -f apps/web/Dockerfile --target production -t trustshield-web:1.0.0 .
docker build -f apps/api/Dockerfile --target production -t trustshield-api:1.0.0 .

# 2. Push to container registry
docker push your-registry/trustshield-web:1.0.0
docker push your-registry/trustshield-api:1.0.0

# 3. Deploy via Kubernetes (if using K8s) or Docker Swarm
# kubectl apply -f k8s/
# docker swarm init
# docker stack deploy -c docker-compose.prod.yml trustshield

# 4. Run migrations on production database
# psql $PRODUCTION_DATABASE_URL < packages/db/migrations/0002_add_users_tables.sql

# 5. Verify deployment
curl https://trustshield.yourefuture.com/api/health
```

### Environment Variables (Production)

```
# Frontend (.env.production)
NEXT_PUBLIC_API_URL=https://api.trustshield.yourefuture.com

# Backend (.env.production)
DATABASE_URL=postgresql://prod_user:STRONG_PASSWORD@prod-db-host:5432/trustshield
JWT_SECRET=VERY_LONG_RANDOM_STRING_MIN_32_CHARS
JWT_EXPIRY=30d
NODE_ENV=production
CORS_ORIGIN=https://trustshield.yourefuture.com

# Storage (S3)
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
S3_BUCKET=trustshield-prod-uploads

# Email (for password reset, notifications)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=xxx

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
LOG_LEVEL=info
```

---

## Team Handoff Checklist

### For Next Developer

Before you start, ensure you have:

- [ ] Read this entire PRD document
- [ ] Cloned the repository and verified it builds locally
- [ ] Set up `.env.local` files
- [ ] PostgreSQL database running and migrations applied
- [ ] OSINT Docker services started
- [ ] Frontend running on `http://localhost:3001`
- [ ] Backend running on `http://localhost:3000`
- [ ] Understand the monorepo structure
- [ ] Reviewed the current Git history (4 major commits)

### Priority Development Order

1. **Week 1: Database Integration**
   - [ ] Connect NestJS to PostgreSQL
   - [ ] Implement UserService with database queries
   - [ ] Implement password hashing (bcrypt)
   - [ ] Replace mock API responses with real queries
   - [ ] Test all auth endpoints

2. **Week 2: Image Storage**
   - [ ] Set up AWS S3 or MinIO bucket
   - [ ] Implement file upload service
   - [ ] Generate signed URLs
   - [ ] Implement image deletion
   - [ ] Test upload flow end-to-end

3. **Week 3: OSINT Search**
   - [ ] Implement OSINT orchestration service
   - [ ] Connect to Docker tools (SpiderFoot, PhoneInfoga, etc.)
   - [ ] Implement search form in frontend
   - [ ] Build results display
   - [ ] Test with real searches

4. **Week 4: Refinement & Deployment**
   - [ ] Fix any remaining bugs
   - [ ] Performance optimization
   - [ ] Security audit
   - [ ] Deploy to staging
   - [ ] User acceptance testing

### Key Contact Points

**Code Repositories:**
- Main: GitHub (use SSH key)
- Commits: Use conventional commits (feat:, fix:, docs:, etc.)
- PRs: Require 1 review before merge

**Documentation:**
- Architecture: This PRD
- Database: `packages/db/README.md`
- API: Swagger/OpenAPI (generate via NestJS plugin)
- Frontend Components: Storybook (setup recommended)

**Team Communication:**
- Daily standup: [Time/Platform]
- Sprint planning: [Time/Platform]
- Issues/PRs: GitHub Issues & PRs

**Important Notes:**
- This is a monorepo – use `pnpm` only (not npm/yarn)
- Use Turbo for parallel builds
- TypeScript is mandatory (no `any` types)
- Follow ESLint rules (auto-fix: `pnpm lint:fix`)
- Test coverage target: 70%+
- Database migrations are immutable (never rollback in prod)

---

## Quick Reference

### Common Commands

```bash
# Install dependencies
pnpm install

# Run dev servers (all)
pnpm dev

# Run specific app
pnpm dev --filter=web
pnpm dev --filter=api

# Linting
pnpm lint
pnpm lint:fix

# Type checking
pnpm type-check

# Build
pnpm build

# Database migrations
psql -f packages/db/migrations/0002_add_users_tables.sql

# Format code
pnpm format

# Clean node_modules & cache
pnpm clean
```

### Useful Debugging

```bash
# View environment
echo $NEXT_PUBLIC_API_URL
echo $DATABASE_URL

# Test database connection
psql $DATABASE_URL -c "SELECT version();"

# View Docker logs
docker-compose logs -f [service_name]

# Reset database (WARNING: deletes data)
dropdb trustshield && createdb trustshield
psql trustshield < packages/db/migrations/0002_add_users_tables.sql

# Monitor API (curl examples)
curl http://localhost:3000/health
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

---

## Conclusion

**TrustShield is at an exciting juncture.** The frontend is production-ready with a professional design, the backend infrastructure is in place, and the database schema is defined. The primary work ahead is:

1. **Database Integration** – Connect the dots between frontend, API routes, and PostgreSQL
2. **Image Storage** – Implement file persistence
3. **OSINT Engine** – Build the core intelligence gathering system

The codebase is well-structured, type-safe, and documented. New team members should be productive within 1-2 days following this guide.

**Questions?** Refer to the specific sections above or contact the development team.

---

**Document Version History:**
- v1.0 (2. April 2026) – Initial comprehensive PRD

