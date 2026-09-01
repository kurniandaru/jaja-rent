-- ==============================================================================
-- 004_customers.sql
-- B2C Individual Retail Customers
-- ==============================================================================

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_type customer_type NOT NULL DEFAULT 'INDIVIDUAL',
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    identity_type TEXT NOT NULL DEFAULT 'KTP', -- KTP / Passport / SIM
    identity_number TEXT NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

