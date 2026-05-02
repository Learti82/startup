-- PronA Analyzer - Database Schema
-- Kosovo Property Legality & Construction Risk Analyzer

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  full_name       VARCHAR(255) NOT NULL,
  role            VARCHAR(50)  NOT NULL DEFAULT 'buyer',
                  -- buyer | lawyer | bank | developer | admin
  phone           VARCHAR(50),
  consent_gdpr    BOOLEAN NOT NULL DEFAULT FALSE,
  consent_date    TIMESTAMP,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_role CHECK (role IN ('buyer','lawyer','bank','developer','admin'))
);

-- ─────────────────────────────────────────────
-- PROPERTIES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS properties (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title               VARCHAR(500) NOT NULL,
  address             TEXT NOT NULL,
  municipality        VARCHAR(255),
  parcel_number       VARCHAR(100),
  property_type       VARCHAR(100),
                      -- apartment | house | land | commercial
  area_sqm            DECIMAL(10,2),
  asking_price_eur    DECIMAL(15,2),
  seller_name         VARCHAR(255),
  seller_id_number    VARCHAR(100),
  developer_name      VARCHAR(255),
  status              VARCHAR(50) NOT NULL DEFAULT 'pending',
                      -- pending | analyzing | complete | archived
  coordinates_lat     DECIMAL(10,8),
  coordinates_lng     DECIMAL(11,8),
  notes               TEXT,
  created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_status CHECK (status IN ('pending','analyzing','complete','archived'))
);

-- ─────────────────────────────────────────────
-- DOCUMENTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id         UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES users(id),
  document_type       VARCHAR(100) NOT NULL,
                      -- cadastral_extract | construction_permit | ownership_contract
                      -- mortgage_certificate | id_document | use_permit
                      -- property_tax | court_order | other
  original_filename   VARCHAR(500) NOT NULL,
  stored_filename     VARCHAR(500) NOT NULL,
  file_path           TEXT NOT NULL,
  file_size_bytes     INTEGER,
  mime_type           VARCHAR(100),
  encryption_iv       VARCHAR(255),
  is_encrypted        BOOLEAN NOT NULL DEFAULT TRUE,
  ocr_text            TEXT,
  ocr_status          VARCHAR(50) NOT NULL DEFAULT 'pending',
  extracted_data      JSONB,
  upload_date         TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_ocr_status CHECK (ocr_status IN ('pending','processing','complete','failed'))
);

-- ─────────────────────────────────────────────
-- RISK REPORTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS risk_reports (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id         UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  overall_score       INTEGER CHECK (overall_score BETWEEN 0 AND 100),
  overall_status      VARCHAR(20) NOT NULL DEFAULT 'yellow',
  cadastral_status    VARCHAR(20) NOT NULL DEFAULT 'yellow',
  permit_status       VARCHAR(20) NOT NULL DEFAULT 'yellow',
  ownership_status    VARCHAR(20) NOT NULL DEFAULT 'yellow',
  mortgage_status     VARCHAR(20) NOT NULL DEFAULT 'yellow',
  developer_status    VARCHAR(20) NOT NULL DEFAULT 'yellow',
  ai_summary          TEXT,
  questions_for_seller    TEXT[] DEFAULT '{}',
  questions_for_notary    TEXT[] DEFAULT '{}',
  missing_documents       TEXT[] DEFAULT '{}',
  disclaimer          TEXT DEFAULT 'PARALAJMËRIM LIGJOR: Ky raport është informativ dhe nuk përbën këshillë ligjore. Konsultohuni me noter ose avokat të licencuar para çdo transaksioni.',
  generated_by        VARCHAR(50) NOT NULL DEFAULT 'ai',
  version             INTEGER NOT NULL DEFAULT 1,
  created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- RISK ITEMS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS risk_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id           UUID NOT NULL REFERENCES risk_reports(id) ON DELETE CASCADE,
  category            VARCHAR(100) NOT NULL,
  severity            VARCHAR(20) NOT NULL,
  title               VARCHAR(500) NOT NULL,
  description         TEXT NOT NULL,
  recommendation      TEXT,
  source_document_id  UUID REFERENCES documents(id),
  is_resolved         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_severity CHECK (severity IN ('red','yellow','green','info'))
);

-- ─────────────────────────────────────────────
-- SUBSCRIPTIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan                    VARCHAR(50) NOT NULL DEFAULT 'free',
  status                  VARCHAR(50) NOT NULL DEFAULT 'active',
  reports_used            INTEGER NOT NULL DEFAULT 0,
  reports_limit           INTEGER NOT NULL DEFAULT 1,
  price_eur               DECIMAL(10,2) DEFAULT 0,
  starts_at               TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at              TIMESTAMP,
  stripe_subscription_id  VARCHAR(255),
  created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_plan CHECK (plan IN ('free','basic','professional','enterprise')),
  CONSTRAINT chk_sub_status CHECK (status IN ('active','expired','cancelled'))
);

-- ─────────────────────────────────────────────
-- AUDIT LOGS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  action          VARCHAR(100) NOT NULL,
  resource_type   VARCHAR(100),
  resource_id     UUID,
  ip_address      INET,
  user_agent      TEXT,
  metadata        JSONB,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- DEVELOPER PROFILES (mock database for risk profiling)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS developer_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                VARCHAR(255) NOT NULL,
  registration_number VARCHAR(100),
  municipality        VARCHAR(255),
  risk_score          INTEGER CHECK (risk_score BETWEEN 0 AND 100),
  completed_projects  INTEGER NOT NULL DEFAULT 0,
  pending_projects    INTEGER NOT NULL DEFAULT 0,
  legal_issues_count  INTEGER NOT NULL DEFAULT 0,
  notes               TEXT,
  source              VARCHAR(100) NOT NULL DEFAULT 'mock',
  created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON properties(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_documents_property_id ON documents(property_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_reports_property_id ON risk_reports(property_id);
CREATE INDEX IF NOT EXISTS idx_risk_items_report_id ON risk_items(report_id);
CREATE INDEX IF NOT EXISTS idx_risk_items_severity ON risk_items(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
