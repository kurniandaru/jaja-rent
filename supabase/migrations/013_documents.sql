-- ==============================================================================
-- 013_documents.sql
-- Vehicle Legal Documents & Compliance Tracking (STNK, KIR, Insurance, Tax)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS vehicle_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    document_type document_type NOT NULL,
    document_number TEXT NOT NULL,
    issued_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    file_url TEXT,
    cost_to_renew NUMERIC DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

