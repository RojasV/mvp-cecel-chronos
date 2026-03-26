# Product & Engineering Specification

**Project:** Intelligent luxury watch management platform  
**Client context:** Exclusive proposal for Marcelo Miranda Soares Neto  
**Delivery / build:** Horizon (CNPJ 46.267.921/0001-16)  
**Stack (target):** Next.js (App Router + API layer), Supabase (Postgres, Auth, Storage, RLS)  
**Document purpose:** Align **product requirements** and **technical architecture** before implementation. This is **not** the marketing blueprint deck; it is the spec for structuring the real application.

---

## 1. Scope separation

| Artifact | Role |
|----------|------|
| **Blueprint slides** (existing) | Sales / alignment narrative; does not need to list every module. |
| **This document** | Source of truth for **what to build**, **how to structure code**, and **phasing**. |

Items intentionally **out of the slide deck** but **in scope for the product** (to be specified here):

- Operational **dashboard** (KPIs, pipeline, alerts).
- **Financial** area: revenue/cost visibility, **DRE-oriented** reporting (structure TBD with accounting advisor).
- **Payments / cash events**: register and reconcile inflows/outflows tied to sales, purchases, or operational expenses.

---

## 2. Product vision

A single, secure platform to: ingest watch assets (photos + structured data with AI assistance), maintain authoritative inventory with statuses, generate consistent marketing assets, expose a **public storefront URL** for the client’s collection, integrate **WhatsApp-oriented** workflows where applicable, and extend into **financial visibility** (dashboard + DRE-style reports + payment registration) without fragmenting data across spreadsheets.

---

## 3. Stakeholders & roles (initial)

- **Owner / primary user:** Marcelo Miranda Soares Neto (and delegated staff if multi-user is enabled).
- **Builder:** Horizon engineering.
- **Future:** Optional accountant / finance reviewer for DRE categorization rules.

**Assumption to validate:** Single-tenant deployment per client vs multi-tenant SaaS. Spec below supports **single-tenant first** (simpler RLS and branding) with a path to multi-tenant later via `organization_id` on all domain rows.

---

## 4. Functional requirements

### 4.1 Identity & access

- **FR-AUTH-01:** Email/password (or magic link) authentication via Supabase Auth.
- **FR-AUTH-02:** Role-based access (e.g. `owner`, `operator`, `readonly`, `finance`) — exact roles to confirm.
- **FR-AUTH-03:** Session handling compatible with Next.js (server components + route handlers); no secrets in client bundles.

### 4.2 Catalog & inventory (core from blueprint)

- **FR-INV-01:** Create/edit watch records: brand, model, reference, condition, accessories, price, description, status (`draft`, `available`, `reserved`, `sold`, etc.).
- **FR-INV-02:** Image upload to object storage (Supabase Storage); multiple images per watch; primary image flag.
- **FR-INV-03:** AI-assisted field suggestions from image (external provider TBD); human must confirm before persistence as “official” data.
- **FR-INV-04:** Search and filters (text, status, price range).
- **FR-INV-05:** Status transitions with audit trail (who changed what, when).

### 4.3 Public storefront

- **FR-PUB-01:** Public, read-only catalog at a stable path or subdomain (e.g. `/c/[slug]` or `loja.cliente.com`).
- **FR-PUB-02:** Only watches marked “public / available” (rules configurable).
- **FR-PUB-03:** No authentication required for visitors; rate limiting and bot mitigation considered.

### 4.4 Marketing assets

- **FR-MKT-01:** Generate one or more **layout templates** (image + text + price) from canonical watch data + selected photo.
- **FR-MKT-02:** Export or share flow (download, copy text, future WhatsApp deep link / API — phase-dependent).

### 4.5 WhatsApp (phased)

- **FR-WA-01:** Document target: manual copy-paste first; semi-automated “open WhatsApp with prefilled message” second; full automation only with official API and legal/compliance sign-off.
- **FR-WA-02:** Daily digest / scheduled message is **optional phase 2**; requires explicit product decision and infra (cron + queue).

### 4.6 Dashboard (new vs slides)

- **FR-DASH-01:** Home dashboard: counts by status, recent activity, watches added/sold in period.
- **FR-DASH-02:** Simple sales funnel or pipeline view if `reserved` / negotiation states are introduced.
- **FR-DASH-03:** Alerts (e.g. long-in-stock, missing photo, draft backlog).

### 4.7 Financial: DRE orientation & payments (new vs slides)

**Note:** DRE is legally and accounting-sensitive. The product should **model transactions and categories**; the exact DRE layout should be **validated with an accountant**.

- **FR-FIN-01:** Register **financial events**: type (inflow/outflow), amount, date, currency (BRL default), category (COGS, opex, revenue, tax bucket — enum extensible), optional link to a **watch** (sale) or **supplier** / manual description.
- **FR-FIN-02:** Attach proof (receipt image/PDF) to Storage, linked to event.
- **FR-FIN-03:** **DRE-style report**: aggregate by period and category; export CSV; PDF optional later.
- **FR-FIN-04:** Reconciliation view: “sales recorded in inventory” vs “cash inflows registered” (flag mismatches).
- **FR-FIN-05:** Permissions: finance role can see amounts; operator may be restricted (configurable).

### 4.8 Admin & compliance

- **FR-ADM-01:** Audit log for sensitive actions (auth, price changes, status to sold, financial entries).
- **FR-ADM-02:** Data export for backup / portability (owner-only).

---

## 5. Non-functional requirements

| ID | Requirement |
|----|-------------|
| NFR-01 | **Security:** Row Level Security on all Supabase tables; service role only on server; never expose service key to browser. |
| NFR-02 | **Privacy:** LGPD-aligned handling of personal data; minimal PII; data processing agreement if using third-party AI. |
| NFR-03 | **Performance:** Dashboard and list views paginated; images via CDN URLs; lazy loading. |
| NFR-04 | **Reliability:** Idempotent writes where possible (e.g. payment registration with client-generated idempotency key). |
| NFR-05 | **Maintainability:** SOLID + clear module boundaries; testable domain layer. |
| NFR-06 | **Observability:** Structured logging in API route handlers; error tracking (Sentry or similar) TBD. |

---

## 6. Architecture (Next.js + Supabase)

### 6.1 High-level

```
Browser
  → Next.js (React UI, Server Components, Server Actions where appropriate)
  → Route Handlers (/app/api/...)  ← thin HTTP adapters
  → Application services / use cases  ← orchestration
  → Domain (entities, value objects, domain services)  ← pure TS, no React
  → Infrastructure (Supabase client, Storage, AI provider adapters)
  → Supabase (Postgres + Auth + Storage + RLS)
```

- **UI:** App Router, colocated UI components, forms with validation (e.g. Zod).
- **API:** Prefer **Route Handlers** for REST-style endpoints and webhooks; **Server Actions** for mutations tightly coupled to forms when it reduces boilerplate—keep the **use case** behind both.
- **Database:** Supabase Postgres; migrations via Supabase CLI or SQL files in repo; RLS policies per table.

### 6.2 Applying SOLID (practical mapping)

| Principle | Application |
|-----------|-------------|
| **S**ingle Responsibility | One class/module per reason to change: e.g. `WatchRepository` only persists watches; `GenerateMarketingCardUseCase` only orchestrates asset generation. |
| **O**pen/Closed | Extend behavior via new strategies (e.g. `PricingRule`, `ReportExporter`) without modifying core aggregates. |
| **L**iskov Substitution | Repository interfaces implemented by `SupabaseWatchRepository` and, in tests, `InMemoryWatchRepository`. |
| **I**nterface Segregation | Small ports: `IClock`, `IImageStorage`, `IWatchReadPort`, `IWatchWritePort` rather than one giant “database” interface. |
| **D**ependency Inversion | Use cases depend on **abstractions**; composition root (e.g. `lib/di.ts` or factory per request) wires Supabase implementations. |

### 6.3 OOP + TypeScript

- **Entities:** `Watch`, `FinancialTransaction`, `UserMembership` — encapsulate invariants (e.g. cannot set `sold` without `sold_at`).
- **Value objects:** `Money`, `WatchStatus`, `CategoryCode`.
- **Domain services:** Cross-aggregate rules (e.g. linking a sale to inventory and a financial inflow).
- **Application services (use cases):** `RegisterPayment`, `ListWatchesForDashboard`, `PublishWatchToStorefront`.
- **DTOs:** Separate API request/response shapes from domain models; map at the edge.

### 6.4 Suggested folder layout (monolith Next.js app)

```
src/
  app/                    # routes, layouts, route handlers
  domain/                 # entities, value objects, domain services, ports (interfaces)
  application/            # use cases (commands/queries)
  infrastructure/         # supabase, storage, ai, email adapters
  shared/                 # errors, result type, zod schemas shared at edge
```

Adjust naming to team preference (`core/`, `modules/watch/`, etc.) but **keep domain free of Next.js imports**.

### 6.5 Supabase specifics

- **Auth:** JWT in cookies (SSR pattern) or Bearer for API clients; align with Next.js middleware for protected routes.
- **RLS:** Policies like `auth.uid() IN (SELECT user_id FROM memberships WHERE org_id = watches.org_id)`.
- **Storage:** Buckets `watch-images`, `finance-attachments`; policies mirroring RLS.
- **Realtime (optional):** Inventory updates on dashboard via Supabase Realtime — phase 2.

---

## 7. Data model (conceptual)

**Core tables (illustrative):**

- `organizations` (if multi-tenant) or single row for single-tenant.
- `profiles` / link to `auth.users`.
- `memberships` (user ↔ org, role).
- `watches` (all inventory fields + `public_slug`, `published_at`).
- `watch_images` (fk watch, url, sort, is_primary).
- `watch_status_history` (audit).
- `financial_transactions` (amount, direction, category, occurred_at, description, fk_watch nullable, attachment_path).
- `audit_logs` (optional generic table).

**Indexes:** status, org_id, created_at, full-text search on brand/model/reference (Postgres `tsvector` or simple `ilike` for MVP).

---

## 8. API surface (initial)

REST-style under `/api/v1/` (versioning optional):

- `POST /api/v1/watches` / `GET /api/v1/watches` / `PATCH /api/v1/watches/:id`
- `POST /api/v1/watches/:id/images`
- `GET /api/v1/dashboard/summary`
- `POST /api/v1/finance/transactions` / `GET /api/v1/finance/transactions` / `GET /api/v1/finance/reports/dre?from=&to=`
- `GET /api/public/catalog/:slug` (or dedicated public route without `/api`)

Public catalog may be implemented as **Server Component + direct Supabase read** with **anon key + strict RLS** instead of a separate API, if simpler—document the threat model either way.

---

## 9. Phasing recommendation

| Phase | Scope |
|-------|--------|
| **MVP** | Auth, watches CRUD, images, AI assist (manual confirm), inventory statuses, basic dashboard, public storefront read-only, marketing export (download). |
| **Phase 2** | Financial transactions + categories + DRE report v1; attachments; reconciliation hints. |
| **Phase 3** | WhatsApp automation (official API), scheduled digests, advanced analytics. |

---

## 10. Open decisions (alignment checklist)

- [ ] Single-tenant vs multi-tenant from day one.
- [ ] Exact role matrix and who sees financial amounts.
- [ ] DRE category tree signed off with accountant.
- [ ] AI provider and data processing terms.
- [ ] Public URL strategy (path vs subdomain, custom domain).
- [ ] Currency: BRL only vs multi-currency later.

---

## 11. Traceability to blueprint slides

The slide deck covers narrative and UX metaphors; this spec **subsumes** those flows as FR-INV / FR-PUB / FR-MKT / FR-WA and **extends** them with FR-DASH and FR-FIN. No change to the slide file is required for the new modules unless you want a separate “internal roadmap” deck.

---

*Document version: 1.0 — for engineering alignment prior to Next.js repository bootstrap.*
