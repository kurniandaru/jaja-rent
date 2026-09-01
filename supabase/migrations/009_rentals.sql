-- ==============================================================================
-- 009_rentals.sql
-- Unified Rental Deployments (B2C Retail & B2B Corporate)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS rentals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rental_number TEXT NOT NULL UNIQUE,
    rental_type rental_type NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    corporate_customer_id UUID REFERENCES corporate_customers(id) ON DELETE SET NULL,
    contract_id UUID REFERENCES corporate_contracts(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    actual_return_date DATE,
    status rental_status NOT NULL DEFAULT 'ACTIVE',
    with_driver BOOLEAN NOT NULL DEFAULT false,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    pickup_location TEXT NOT NULL DEFAULT 'Pool Jakarta Pusat',
    dropoff_location TEXT NOT NULL DEFAULT 'Pool Jakarta Pusat',
    total_amount NUMERIC NOT NULL DEFAULT 0,
    deposit_amount NUMERIC NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    -- Constraint: Enforce clear separation between B2C customer and B2B corporate customer
    CONSTRAINT rental_type_check CHECK (
        (rental_type = 'B2C' AND customer_id IS NOT NULL AND corporate_customer_id IS NULL) OR
        (rental_type = 'B2B' AND corporate_customer_id IS NOT NULL AND customer_id IS NULL)
    )
);

