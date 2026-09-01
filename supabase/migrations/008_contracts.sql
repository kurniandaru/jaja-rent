-- ==============================================================================
-- 008_contracts.sql
-- Corporate Master Contracts & Vehicle Quotas
-- ==============================================================================

CREATE TABLE IF NOT EXISTS corporate_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_number TEXT NOT NULL UNIQUE,
    corporate_customer_id UUID NOT NULL REFERENCES corporate_customers(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status contract_status NOT NULL DEFAULT 'ACTIVE',
    billing_cycle billing_cycle_type NOT NULL DEFAULT 'MONTHLY',
    monthly_billing_amount NUMERIC NOT NULL DEFAULT 0,
    payment_term TEXT NOT NULL DEFAULT 'Net 30 Days',
    required_vehicle_count INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS contract_vehicle_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES corporate_contracts(id) ON DELETE CASCADE,
    vehicle_type TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

