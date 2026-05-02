# PronA — Property Legality & Construction Risk Analyzer

**Kosovo-first MVP** for verifying apartment/land legality before paying deposits.

> PARALAJMËRIM LIGJOR: PronA është mjet informativ. Nuk zëvendëson avokatin ose noterin.

---

## What It Does

Upload property documents → AI analyzes for legal consistency → Red/Yellow/Green risk report with:
- Cadastral register check
- Construction permit validity
- Ownership chain verification
- Mortgage & liens detection
- Developer risk profile
- Missing-document checklist
- Questions to ask seller & notary

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL 15 |
| Auth | JWT (bcrypt passwords) |
| AI | Anthropic Claude (mock fallback) |
| File Security | AES-256-CBC encryption at rest |
| Container | Docker + Docker Compose |

---

## Quick Start (Docker — recommended)

```bash
# 1. Clone and configure
cp .env.example .env
# Edit .env — set ANTHROPIC_API_KEY for real AI analysis (optional)

# 2. Start everything
docker compose up --build

# App:    http://localhost:5173
# API:    http://localhost:3001/api/health
# DB:     localhost:5432
```

---

## Local Development (no Docker)

### Prerequisites
- Node.js 20+
- PostgreSQL 15+

### Server

```bash
cd server
npm install
cp ../.env.example .env
# Edit .env with your DATABASE_URL

# Run database migrations + seed
psql $DATABASE_URL -f db/001_schema.sql
psql $DATABASE_URL -f db/seed.sql

# Start dev server
npm run dev
# → http://localhost:3001
```

### Client

```bash
cd client
npm install
npm run dev
# → http://localhost:5173
```

---

## Demo Accounts (seed data)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@prona.ks | Admin@2024! |
| Buyer | arbeni@demo.ks | password123 |
| Lawyer | avokati@demo.ks | password123 |
| Bank | banka@demo.ks | password123 |

---

## API Endpoints

```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login

GET    /api/users/me               Get current user + subscription
PUT    /api/users/me               Update profile
DELETE /api/users/me               Delete account (GDPR)
GET    /api/users/me/export        Export all user data (GDPR)

POST   /api/properties             Create property
GET    /api/properties             List user's properties
GET    /api/properties/:id         Get property details
PUT    /api/properties/:id         Update property
DELETE /api/properties/:id         Delete property

POST   /api/properties/:id/documents        Upload document
GET    /api/properties/:id/documents        List documents
GET    /api/properties/:id/documents/:docId/download  Download decrypted
DELETE /api/properties/:id/documents/:docId Delete document

POST   /api/properties/:id/analyze   Generate AI risk report
GET    /api/properties/:id/report    Get risk report

GET    /api/admin/stats             Dashboard stats
GET    /api/admin/users             User management
PUT    /api/admin/users/:id/toggle-active
GET    /api/admin/reports           All reports
GET    /api/admin/audit-logs        Audit trail
```

---

## Database Schema

```
users               → auth, roles, GDPR consent
properties          → property metadata, coordinates
documents           → encrypted file storage, OCR status
risk_reports        → overall + per-category scores, AI text
risk_items          → individual findings (red/yellow/green/info)
subscriptions       → plan, usage limits
audit_logs          → full action trail
developer_profiles  → mock risk database for builders
```

---

## AI Integration

When `ANTHROPIC_API_KEY` is set in `.env`, the system calls **Claude claude-opus-4-7** to:
1. Analyze OCR text from uploaded documents
2. Detect inconsistencies across documents
3. Generate Albanian-language risk summary
4. Produce contextual questions for seller/notary

Without the API key, it uses smart mock analysis based on document presence scoring.

### To add real OCR (future integration):
Replace the `ocr_text` stub in `server/src/routes/documents.ts` with Tesseract.js or AWS Textract call.

---

## Monetization

| Plan | Price | Reports | Target |
|------|-------|---------|--------|
| Free | €0 | 1 | First-time buyers |
| Basic | €19/report | 1 | Regular buyers |
| Professional | €99/month | 50 | Lawyers, notaries |
| Enterprise | €299/month | Unlimited | Banks, institutions |

---

## Privacy & Security

- AES-256-CBC encryption for all uploaded documents
- Secure file deletion (overwrite before unlink)
- GDPR-compliant: export & delete account endpoints
- JWT auth with rate limiting on login
- Helmet.js security headers
- Rate limiting: 200 req/15min global, 20 req/15min for auth
- Audit log of every action

---

## Kosovo Launch Plan

### Phase 1 — Prishtinë Beta (Month 1–2)
- [ ] Partner with 3 real estate agencies (Prishtinë, Prizren, Ferizaj)
- [ ] WhatsApp/Viber launch announcement to diaspora groups (CH, DE, AT, US)
- [ ] Free reports for first 100 beta users (word-of-mouth engine)
- [ ] Presence at Prishtinë property fair (Panairi i Pronës)

### Phase 2 — Monetization (Month 3–4)
- [ ] Paid reports for buyers (€19–€49)
- [ ] Lawyer/notary subscription outreach (targeting 20 in KS)
- [ ] ProCredit Bank & Raiffeisen Kosovo partnership pilot

### Phase 3 — Data & API (Month 5–6)
- [ ] Integrate KCA (Kosovo Cadastral Agency) API for real parcel data
- [ ] Municipal permit database connections (Prishtinë, Prizren)
- [ ] Mobile-optimized PWA (critical for Kosovo users)

### Key Partnerships to Pursue
- **AKK** (Agjencia Kadastrale e Kosovës) — cadastral data API
- **ARBK** (Agjencia e Regjistrimit të Bizneseve) — developer verification
- **Gjykata Supreme** — property dispute checks
- **Kosovo Bar Association** — lawyer dashboard onboarding
- **ProCredit Bank** — bank due-diligence subscription

---

## Project Structure

```
startup/
├── docker-compose.yml
├── .env.example
├── README.md
├── server/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── db/
│   │   ├── 001_schema.sql      ← All tables + indexes
│   │   └── seed.sql            ← Demo users, properties, reports
│   └── src/
│       ├── index.ts            ← Server entry point
│       ├── app.ts              ← Express setup + middleware
│       ├── config/
│       │   ├── database.ts     ← pg pool
│       │   └── env.ts          ← Environment config
│       ├── middleware/
│       │   ├── auth.ts         ← JWT authenticate + requireRole
│       │   ├── errorHandler.ts ← Global error handler
│       │   └── upload.ts       ← Multer file upload
│       ├── routes/
│       │   ├── auth.ts         ← Register, login
│       │   ├── properties.ts   ← CRUD properties
│       │   ├── documents.ts    ← Upload, download, delete docs
│       │   ├── reports.ts      ← Trigger analysis, get report
│       │   ├── users.ts        ← Profile, GDPR
│       │   └── admin.ts        ← Admin dashboard
│       ├── services/
│       │   ├── aiService.ts    ← Claude API + mock fallback
│       │   ├── riskService.ts  ← Report generation logic
│       │   ├── encryptionService.ts ← AES-256 file encryption
│       │   └── auditService.ts ← Action logging
│       └── types/
│           └── index.ts
└── client/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── tailwind.config.js
    ├── vite.config.ts
    └── src/
        ├── App.tsx             ← Routes
        ├── main.tsx            ← Entry point
        ├── index.css           ← Tailwind base
        ├── i18n/
        │   └── sq.ts           ← Albanian strings (all UI text)
        ├── context/
        │   └── AuthContext.tsx
        ├── services/
        │   └── api.ts          ← Axios API client
        ├── components/
        │   ├── Layout.tsx
        │   ├── Navbar.tsx
        │   ├── RiskBadge.tsx   ← Red/Yellow/Green pill
        │   ├── RiskReport.tsx  ← Full report display
        │   ├── DocumentUpload.tsx ← Drag-and-drop uploader
        │   └── PropertyCard.tsx
        ├── pages/
        │   ├── Landing.tsx
        │   ├── Login.tsx
        │   ├── Register.tsx
        │   ├── Dashboard.tsx
        │   ├── NewProperty.tsx
        │   ├── PropertyDetail.tsx
        │   ├── Pricing.tsx
        │   ├── Profile.tsx
        │   └── admin/
        │       └── AdminDashboard.tsx
        └── types/
            └── index.ts
```
