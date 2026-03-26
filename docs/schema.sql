-- ============================================================
-- CHRONOS — Complete Database Schema
-- Plataforma Inteligente de Gestão de Relógios de Luxo
-- Version: 2.0
-- ============================================================
-- Run this file against a fresh Supabase project.
-- All tables have RLS enabled. Policies use org membership.
-- Money is stored as INTEGER (cents BRL) to avoid float errors.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 0. EXTENSIONS
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ────────────────────────────────────────────────────────────
-- 1. ENUMS
-- ────────────────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('owner', 'operator', 'readonly', 'finance');

CREATE TYPE watch_status AS ENUM ('draft', 'available', 'reserved', 'sold', 'consigned');

CREATE TYPE watch_condition AS ENUM ('new', 'unworn', 'excellent', 'very_good', 'good', 'fair');

CREATE TYPE acquisition_type AS ENUM ('direct_purchase', 'consignment', 'trade');

CREATE TYPE consignment_status AS ENUM ('active', 'returned', 'sold');

CREATE TYPE client_status AS ENUM ('lead', 'active', 'recurring', 'inactive');

CREATE TYPE financial_direction AS ENUM ('inflow', 'outflow');

CREATE TYPE financial_category AS ENUM (
  'revenue_sale',
  'revenue_commission',
  'cogs_purchase',
  'cogs_refurbishment',
  'cogs_shipping',
  'opex_marketing',
  'opex_platform',
  'opex_staff',
  'opex_office',
  'opex_other',
  'tax_income',
  'tax_sales',
  'tax_other',
  'transfer_in',
  'transfer_out'
);

CREATE TYPE marketing_format AS ENUM ('photo_description', 'premium_card', 'visual_art');

CREATE TYPE whatsapp_message_status AS ENUM ('pending', 'sent', 'delivered', 'read', 'failed');

CREATE TYPE audit_action AS ENUM (
  'auth_login', 'auth_logout',
  'watch_created', 'watch_updated', 'watch_status_changed', 'watch_deleted',
  'acquisition_created', 'acquisition_updated',
  'client_created', 'client_updated',
  'financial_created', 'financial_updated', 'financial_deleted',
  'marketing_generated',
  'whatsapp_sent',
  'export_data'
);

-- ────────────────────────────────────────────────────────────
-- 2. CORE TABLES
-- ────────────────────────────────────────────────────────────

-- 2.1 Organizations (single-tenant now, multi-tenant ready)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  public_storefront_enabled BOOLEAN NOT NULL DEFAULT true,
  whatsapp_instance_id TEXT, -- Evolution API instance ID
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.2 Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.3 Memberships (user <> org relationship + role)
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'operator',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, org_id)
);

-- ────────────────────────────────────────────────────────────
-- 3. INVENTORY DOMAIN
-- ────────────────────────────────────────────────────────────

-- 3.1 Watches (core entity)
CREATE TABLE watches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Identity
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  reference TEXT, -- manufacturer reference number
  serial_number TEXT, -- unique per watch (optional, sensitive)
  
  -- Description
  description TEXT,
  condition watch_condition,
  dial_color TEXT,
  case_material TEXT,
  case_diameter_mm NUMERIC(5,1),
  movement TEXT, -- e.g. "automatic", "quartz", "manual"
  year_of_production INTEGER,
  accessories TEXT, -- e.g. "box, papers, tags"
  
  -- Pricing (cents BRL)
  asking_price_cents INTEGER NOT NULL DEFAULT 0,
  minimum_price_cents INTEGER, -- floor for negotiation (owner-only visibility)
  
  -- Status & publication
  status watch_status NOT NULL DEFAULT 'draft',
  is_public BOOLEAN NOT NULL DEFAULT false,
  public_slug TEXT UNIQUE,
  published_at TIMESTAMPTZ,
  
  -- AI
  ai_suggestions JSONB, -- raw AI output for reference
  ai_suggestions_confirmed BOOLEAN NOT NULL DEFAULT false,
  
  -- Metadata
  notes TEXT, -- internal notes (never public)
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.2 Watch Images
CREATE TABLE watch_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  watch_id UUID NOT NULL REFERENCES watches(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL, -- Supabase Storage path
  url TEXT NOT NULL, -- public or signed URL
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  alt_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.3 Watch Status History (audit trail)
CREATE TABLE watch_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  watch_id UUID NOT NULL REFERENCES watches(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  from_status watch_status,
  to_status watch_status NOT NULL,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  reason TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 4. ACQUISITION DOMAIN
-- ────────────────────────────────────────────────────────────

-- 4.1 Suppliers
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_phone TEXT,
  contact_email TEXT,
  supplier_type TEXT, -- 'individual', 'store', 'consigner'
  notes TEXT,
  total_purchases_cents INTEGER NOT NULL DEFAULT 0, -- denormalized running total
  total_items INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.2 Acquisitions (1:1 with watch)
CREATE TABLE acquisitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  watch_id UUID NOT NULL UNIQUE REFERENCES watches(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  
  -- Cost
  acquisition_type acquisition_type NOT NULL DEFAULT 'direct_purchase',
  purchase_cost_cents INTEGER NOT NULL DEFAULT 0, -- what was paid to acquire
  additional_costs_cents INTEGER NOT NULL DEFAULT 0, -- refurbishment, shipping, etc.
  additional_costs_description TEXT,
  
  -- Consignment specifics
  consignment_status consignment_status,
  consignment_commission_pct NUMERIC(5,2), -- e.g. 10.00 for 10%
  consignment_deadline DATE,
  
  -- Dates
  acquired_at DATE NOT NULL DEFAULT CURRENT_DATE,
  condition_at_purchase watch_condition,
  
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 5. CRM DOMAIN
-- ────────────────────────────────────────────────────────────

-- 5.1 Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT, -- WhatsApp number
  email TEXT,
  status client_status NOT NULL DEFAULT 'lead',
  
  -- Interests (for matching)
  interest_tags TEXT[] DEFAULT '{}', -- e.g. {'rolex', 'sporty', 'under_100k', 'dress'}
  preferred_brands TEXT[] DEFAULT '{}',
  budget_min_cents INTEGER,
  budget_max_cents INTEGER,
  
  -- Stats (denormalized)
  total_purchases INTEGER NOT NULL DEFAULT 0,
  total_spent_cents BIGINT NOT NULL DEFAULT 0,
  last_purchase_at TIMESTAMPTZ,
  last_interaction_at TIMESTAMPTZ,
  
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5.2 Client Purchases (auto-generated on sale)
CREATE TABLE client_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  watch_id UUID NOT NULL REFERENCES watches(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  sale_price_cents INTEGER NOT NULL,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5.3 Client Follow-ups
CREATE TABLE client_followups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  follow_up_date DATE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 6. MARKETING DOMAIN
-- ────────────────────────────────────────────────────────────

-- 6.1 Marketing Assets
CREATE TABLE marketing_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  watch_id UUID NOT NULL REFERENCES watches(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  format marketing_format NOT NULL,
  image_url TEXT NOT NULL, -- generated image URL
  storage_path TEXT,
  prompt_used TEXT, -- prompt sent to Nano Banana
  text_content TEXT, -- formatted text for copy/paste
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 7. WHATSAPP DOMAIN
-- ────────────────────────────────────────────────────────────

-- 7.1 WhatsApp Messages Log
CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  watch_id UUID REFERENCES watches(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  marketing_asset_id UUID REFERENCES marketing_assets(id) ON DELETE SET NULL,
  
  recipient_phone TEXT NOT NULL,
  recipient_name TEXT,
  message_type TEXT NOT NULL DEFAULT 'media', -- 'text', 'media', 'document'
  content_text TEXT,
  media_url TEXT,
  
  status whatsapp_message_status NOT NULL DEFAULT 'pending',
  evolution_message_id TEXT, -- ID from Evolution API response
  error_message TEXT,
  
  sent_by UUID REFERENCES auth.users(id),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 8. FINANCIAL DOMAIN
-- ────────────────────────────────────────────────────────────

-- 8.1 Financial Transactions
CREATE TABLE financial_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Classification
  direction financial_direction NOT NULL,
  category financial_category NOT NULL,
  
  -- Amount (cents BRL)
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  
  -- Links (optional)
  watch_id UUID REFERENCES watches(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  
  -- Details
  description TEXT NOT NULL,
  occurred_at DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Proof
  attachment_path TEXT, -- Storage path for receipt
  attachment_url TEXT,
  
  -- Idempotency
  idempotency_key TEXT UNIQUE,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 9. AUDIT LOG
-- ────────────────────────────────────────────────────────────

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action audit_action NOT NULL,
  entity_type TEXT, -- 'watch', 'client', 'financial_transaction', etc.
  entity_id UUID,
  metadata JSONB DEFAULT '{}', -- any extra context
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 10. INDEXES
-- ────────────────────────────────────────────────────────────

-- Watches
CREATE INDEX idx_watches_org_id ON watches(org_id);
CREATE INDEX idx_watches_status ON watches(org_id, status);
CREATE INDEX idx_watches_brand ON watches(org_id, brand);
CREATE INDEX idx_watches_public ON watches(org_id, is_public, status) WHERE is_public = true;
CREATE INDEX idx_watches_created ON watches(org_id, created_at DESC);
CREATE INDEX idx_watches_search ON watches USING gin(
  to_tsvector('portuguese', coalesce(brand, '') || ' ' || coalesce(model, '') || ' ' || coalesce(reference, '') || ' ' || coalesce(description, ''))
);

-- Watch Images
CREATE INDEX idx_watch_images_watch ON watch_images(watch_id, sort_order);

-- Acquisitions
CREATE INDEX idx_acquisitions_org ON acquisitions(org_id);
CREATE INDEX idx_acquisitions_supplier ON acquisitions(supplier_id);
CREATE INDEX idx_acquisitions_consignment ON acquisitions(org_id, consignment_status) 
  WHERE consignment_status = 'active';

-- Suppliers
CREATE INDEX idx_suppliers_org ON suppliers(org_id);

-- Clients
CREATE INDEX idx_clients_org ON clients(org_id);
CREATE INDEX idx_clients_status ON clients(org_id, status);
CREATE INDEX idx_clients_tags ON clients USING gin(interest_tags);
CREATE INDEX idx_clients_brands ON clients USING gin(preferred_brands);
CREATE INDEX idx_clients_phone ON clients(org_id, phone);

-- Client Purchases
CREATE INDEX idx_client_purchases_client ON client_purchases(client_id);
CREATE INDEX idx_client_purchases_watch ON client_purchases(watch_id);

-- Marketing Assets
CREATE INDEX idx_marketing_assets_watch ON marketing_assets(watch_id);

-- WhatsApp Messages
CREATE INDEX idx_whatsapp_messages_org ON whatsapp_messages(org_id, created_at DESC);
CREATE INDEX idx_whatsapp_messages_watch ON whatsapp_messages(watch_id);
CREATE INDEX idx_whatsapp_messages_client ON whatsapp_messages(client_id);

-- Financial Transactions
CREATE INDEX idx_financial_org ON financial_transactions(org_id);
CREATE INDEX idx_financial_direction ON financial_transactions(org_id, direction, occurred_at);
CREATE INDEX idx_financial_category ON financial_transactions(org_id, category, occurred_at);
CREATE INDEX idx_financial_watch ON financial_transactions(watch_id);
CREATE INDEX idx_financial_period ON financial_transactions(org_id, occurred_at);

-- Audit
CREATE INDEX idx_audit_org ON audit_logs(org_id, created_at DESC);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id, created_at DESC);

-- Memberships
CREATE INDEX idx_memberships_user ON memberships(user_id);
CREATE INDEX idx_memberships_org ON memberships(org_id);

-- ────────────────────────────────────────────────────────────
-- 11. ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────

-- Helper function: check if current user belongs to an org
CREATE OR REPLACE FUNCTION auth_user_org_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT org_id FROM memberships
  WHERE user_id = auth.uid() AND is_active = true;
$$;

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE watches ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE acquisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Organizations: member can read their orgs
CREATE POLICY "org_select" ON organizations FOR SELECT
  USING (id IN (SELECT auth_user_org_ids()));

-- Profiles: users can read/update their own profile
CREATE POLICY "profile_select" ON profiles FOR SELECT
  USING (id = auth.uid());
CREATE POLICY "profile_update" ON profiles FOR UPDATE
  USING (id = auth.uid());
CREATE POLICY "profile_insert" ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- Memberships: see memberships for your orgs
CREATE POLICY "membership_select" ON memberships FOR SELECT
  USING (org_id IN (SELECT auth_user_org_ids()));

-- Macro policy for org-scoped tables
-- Apply same pattern to all domain tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'watches', 'watch_images', 'watch_status_history',
    'suppliers', 'acquisitions',
    'clients', 'client_purchases', 'client_followups',
    'marketing_assets', 'whatsapp_messages',
    'financial_transactions', 'audit_logs'
  ])
  LOOP
    EXECUTE format(
      'CREATE POLICY "%1$s_select" ON %1$s FOR SELECT USING (org_id IN (SELECT auth_user_org_ids()))',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY "%1$s_insert" ON %1$s FOR INSERT WITH CHECK (org_id IN (SELECT auth_user_org_ids()))',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY "%1$s_update" ON %1$s FOR UPDATE USING (org_id IN (SELECT auth_user_org_ids()))',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY "%1$s_delete" ON %1$s FOR DELETE USING (org_id IN (SELECT auth_user_org_ids()))',
      tbl
    );
  END LOOP;
END $$;

-- Public storefront: anonymous can read public watches
CREATE POLICY "watches_public_read" ON watches FOR SELECT
  USING (is_public = true AND status = 'available');

CREATE POLICY "watch_images_public_read" ON watch_images FOR SELECT
  USING (watch_id IN (SELECT id FROM watches WHERE is_public = true AND status = 'available'));

-- ────────────────────────────────────────────────────────────
-- 12. TRIGGERS
-- ────────────────────────────────────────────────────────────

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'organizations', 'profiles', 'memberships',
    'watches', 'suppliers', 'acquisitions',
    'clients', 'financial_transactions'
  ])
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()',
      tbl
    );
  END LOOP;
END $$;

-- Auto-create status history on watch status change
CREATE OR REPLACE FUNCTION trigger_watch_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO watch_status_history (watch_id, org_id, from_status, to_status, changed_by)
    VALUES (NEW.id, NEW.org_id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER watch_status_audit
  BEFORE UPDATE ON watches
  FOR EACH ROW
  EXECUTE FUNCTION trigger_watch_status_change();

-- Auto-set published_at when watch becomes public+available
CREATE OR REPLACE FUNCTION trigger_watch_publish()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_public = true AND NEW.status = 'available' AND OLD.published_at IS NULL THEN
    NEW.published_at = now();
  END IF;
  IF NEW.is_public = false THEN
    NEW.published_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER watch_publish
  BEFORE UPDATE ON watches
  FOR EACH ROW
  EXECUTE FUNCTION trigger_watch_publish();

-- ────────────────────────────────────────────────────────────
-- 13. VIEWS (for dashboard queries)
-- ────────────────────────────────────────────────────────────

-- Watch with margin calculation
CREATE OR REPLACE VIEW v_watch_margin AS
SELECT
  w.id AS watch_id,
  w.org_id,
  w.brand,
  w.model,
  w.asking_price_cents,
  w.status,
  a.purchase_cost_cents,
  a.additional_costs_cents,
  a.acquisition_type,
  (w.asking_price_cents - COALESCE(a.purchase_cost_cents, 0) - COALESCE(a.additional_costs_cents, 0)) AS gross_margin_cents,
  CASE
    WHEN COALESCE(a.purchase_cost_cents, 0) > 0
    THEN ROUND(
      (w.asking_price_cents - a.purchase_cost_cents - COALESCE(a.additional_costs_cents, 0))::NUMERIC
      / a.purchase_cost_cents * 100, 2
    )
    ELSE NULL
  END AS margin_pct
FROM watches w
LEFT JOIN acquisitions a ON a.watch_id = w.id;

-- Inventory summary per org
CREATE OR REPLACE VIEW v_inventory_summary AS
SELECT
  org_id,
  COUNT(*) FILTER (WHERE status = 'draft') AS draft_count,
  COUNT(*) FILTER (WHERE status = 'available') AS available_count,
  COUNT(*) FILTER (WHERE status = 'reserved') AS reserved_count,
  COUNT(*) FILTER (WHERE status = 'sold') AS sold_count,
  COUNT(*) FILTER (WHERE status = 'consigned') AS consigned_count,
  COUNT(*) AS total_count,
  SUM(asking_price_cents) FILTER (WHERE status = 'available') AS available_value_cents,
  SUM(asking_price_cents) FILTER (WHERE status = 'sold') AS sold_value_cents
FROM watches
GROUP BY org_id;

-- DRE-style aggregation
CREATE OR REPLACE VIEW v_financial_summary AS
SELECT
  org_id,
  date_trunc('month', occurred_at) AS period,
  category,
  direction,
  SUM(amount_cents) AS total_cents,
  COUNT(*) AS transaction_count
FROM financial_transactions
GROUP BY org_id, date_trunc('month', occurred_at), category, direction;

-- ────────────────────────────────────────────────────────────
-- 14. STORAGE BUCKETS (run via Supabase Dashboard or API)
-- ────────────────────────────────────────────────────────────
-- NOTE: Storage bucket creation is done via Supabase Dashboard or supabase-js.
-- These are the buckets needed:
--
-- 1. watch-images     (public for storefront, RLS for management)
-- 2. finance-attachments (private, RLS only)
-- 3. marketing-assets (private, RLS for management, signed URLs for sharing)
--
-- Storage policies should mirror the table RLS patterns above.

-- ────────────────────────────────────────────────────────────
-- 15. SEED DATA (single-tenant setup)
-- ────────────────────────────────────────────────────────────
-- After running this schema, create the first org and admin user:
--
-- 1. Sign up user via Supabase Auth
-- 2. INSERT INTO organizations (name, slug) VALUES ('Marcelo Miranda', 'marcelo-miranda');
-- 3. INSERT INTO profiles (id, full_name) VALUES ('<auth_user_id>', 'Marcelo Miranda Soares Neto');
-- 4. INSERT INTO memberships (user_id, org_id, role) VALUES ('<auth_user_id>', '<org_id>', 'owner');
