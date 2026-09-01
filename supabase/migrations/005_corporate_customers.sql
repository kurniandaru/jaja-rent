-- ==============================================================================
-- 005_corporate_customers.sql
-- B2B Corporate Client Accounts & Designees
-- ==============================================================================

CREATE TABLE IF NOT EXISTS corporate_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    company_registration_number TEXT,
    tax_id TEXT,
    industry TEXT,
    city TEXT NOT NULL DEFAULT 'Jakarta',
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    pic_name TEXT NOT NULL,
    pic_role TEXT NOT NULL,
    pic_phone TEXT NOT NULL,
    pic_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

