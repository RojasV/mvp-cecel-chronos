# CHRONOS — Implementation Context

> **Read this file FIRST before writing any code.**
> This document provides the full context of the project so you can make informed decisions.

## What is Chronos?

Chronos is an intelligent luxury watch management platform built exclusively for Marcelo Miranda Soares Neto. It replaces a manual workflow (photos → AI descriptions → spreadsheets → WhatsApp) with a unified system that handles everything from photo upload to WhatsApp publication.

## Who uses it?

Marcelo Miranda Soares Neto — a luxury watch dealer who buys, manages, and sells high-end watches (Rolex, Patek Philippe, Audemars Piguet, etc.). His primary sales channel is WhatsApp. He photographs each watch, creates descriptions, tracks inventory in spreadsheets, and manually sends promotions to clients and groups.

## What does the system do?

The complete flow:
1. **Login** → secure private access
2. **Upload photo** of a watch
3. **AI analyzes** the photo and suggests: brand, model, material, color, description
4. **Human reviews** and confirms/edits the AI suggestions
5. **Watch enters inventory** with status tracking (draft → available → reserved → sold)
6. **System generates marketing materials** using Nano Banana Pro 2 (AI image generation) — 3 formats: photo+description, premium card, visual art
7. **Publish to WhatsApp** via Evolution API — to groups or individual clients
8. **CRM matches** new watches with interested clients automatically
9. **Track sale** — when sold, links to client, updates inventory, generates financial transaction
10. **Financial visibility** — revenue, costs, margins, DRE-style reports

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14+ (App Router), TypeScript, Tailwind CSS, Shadcn/UI |
| Backend | Next.js Route Handlers + Server Actions |
| Database | Supabase (PostgreSQL + Auth + Storage + RLS) |
| AI Vision | Gemini Vision API (watch image analysis) |
| AI Image Gen | Nano Banana Pro 2 via fal.ai (marketing materials) |
| WhatsApp | Evolution API (self-hosted or cloud) |
| Architecture | Clean Architecture + SOLID + OOP |

## Architecture Summary

```
UI (React/Next.js)
  ↓
Route Handlers / Server Actions (thin HTTP adapters)
  ↓
Application Layer (Use Cases) — orchestration only
  ↓
Domain Layer (Entities, VOs, Domain Services, Ports) — pure TS, zero deps
  ↓
Infrastructure Layer (Supabase repos, AI adapters, WhatsApp adapter)
  ↓
External Services (Supabase, Gemini, fal.ai, Evolution API)
```

**Key rules:**
- Domain has ZERO external imports
- Use cases depend on interfaces (ports), never concrete implementations
- Composition root (`src/lib/di.ts`) wires everything
- Money is always INTEGER cents (never float)
- All tables have RLS enabled
- All inputs validated with Zod at API boundary

## Files in this kit

| File | Purpose |
|------|---------|
| `.cursorrules` | Coding rules, naming conventions, architectural constraints. The AI MUST follow these at all times. |
| `schema.sql` | Complete PostgreSQL schema — all tables, enums, indexes, RLS policies, triggers, views. Run on Supabase before coding. |
| `DEV-PLAN.md` | Phase-by-phase task breakdown. Execute tasks sequentially. Each task has dependencies and done criteria. |
| `IMPLEMENTATION-CONTEXT.md` | This file. Read first for full project understanding. |

## How to work with this kit

### Starting a new phase
1. Read the phase overview in `DEV-PLAN.md`
2. Start with task P{N}-T01 and proceed sequentially
3. Each task specifies dependencies — don't skip ahead
4. Follow the order within each task: Domain → Port → Infrastructure → Use Case → API → UI

### When building a feature
1. Check `.cursorrules` for architectural rules
2. Check `schema.sql` for the exact table structure and column types
3. Check `DEV-PLAN.md` for the task's scope and done criteria
4. Build following Clean Architecture layers (domain first, UI last)
5. Validate with Zod at boundaries, use Result pattern for errors

### Environment variables needed
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Gemini Vision (AI image analysis)
GEMINI_API_KEY=AI...

# Nano Banana Pro 2 via fal.ai (marketing image generation)
FAL_KEY=key-...

# Evolution API (WhatsApp)
EVOLUTION_API_URL=https://your-instance.com
EVOLUTION_API_KEY=your-key
EVOLUTION_INSTANCE_NAME=chronos
```

## Visual Design Direction

- **Theme:** Dark, luxury, premium — inspired by high-end watchmaking
- **Primary colors:** Navy (#0F1724), Gold (#C9A84C), Dark surfaces (#12121A, #1A1A24)
- **Text:** Light (#F0EDE6) on dark backgrounds, gold for accents
- **Typography:** Serif for headings (luxury feel), sans-serif for body (clarity)
- **Components:** Shadcn/UI with custom dark theme tokens
- **Tone:** Professional, sophisticated, minimalist — never flashy or generic

## Domain Vocabulary

| Term | Meaning |
|------|---------|
| Relógio | Watch (the core asset) |
| Estoque | Inventory |
| Vitrine | Storefront (public catalog) |
| Fornecedor | Supplier (who Marcelo buys from) |
| Aquisição | Acquisition (the purchase event) |
| Consignação | Consignment (watch held on behalf of someone, commission-based) |
| Cliente | Client/buyer |
| Divulgação | Marketing/promotion |
| Material | Marketing asset (generated image + text) |
| DRE | Demonstração do Resultado do Exercício (income statement) |
| Margem | Profit margin (sale price - acquisition cost - additional costs) |

## Important Business Rules

1. **A watch can only be published (is_public=true) if status is 'available'** — never draft or sold
2. **AI suggestions must be confirmed by human** before being treated as official data
3. **Consignment watches** have a deadline and commission % — the system alerts when deadline approaches
4. **When a watch is sold**, the system should prompt for: who bought it (CRM), and auto-generate financial transactions
5. **Margin calculation**: asking_price - purchase_cost - additional_costs (all in cents)
6. **Financial transactions** use idempotency keys to prevent double-registration
7. **WhatsApp messages** are always logged for audit trail
8. **Client matching** is based on: preferred_brands overlapping watch brand, budget range containing asking_price, and interest_tags matching watch characteristics
9. **Status transitions**: draft → available → reserved → sold (main flow); reserved → available (unreserve); any → draft (revert to draft)
10. **Minimum price** is owner-only visibility — operators and public never see it
