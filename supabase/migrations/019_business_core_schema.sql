-- ==============================================================================
-- 019_business_core_schema.sql
-- Jaja Rent Phase 1: Business Core Schema Extension
-- Customer Master, Documents, Agreements, Reservations, Charges, Payments, Deposits & Audit Trail
-- ==============================================================================

-- 1. Extend or create sequences for standardized entity numbers
CREATE SEQUENCE IF NOT EXISTS customer_number_seq START WITH 1;
CREATE SEQUENCE IF NOT EXISTS reservation_number_seq START WITH 1;
CREATE SEQUENCE IF NOT EXISTS contract_number_seq START WITH 1;
CREATE SEQUENCE IF NOT EXISTS payment_number_seq START WITH 1;

-- 2. Extend customers table with Phase 1 fields
ALTER TABLE customers 
    ADD COLUMN IF NOT EXISTS customer_number TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS date_of_birth DATE,
    ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Jakarta',
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'DRAFT',
    ADD COLUMN IF NOT EXISTS license_type TEXT,
    ADD COLUMN IF NOT EXISTS license_number TEXT,
    ADD COLUMN IF NOT EXISTS license_expiry DATE,
    ADD COLUMN IF NOT EXISTS license_status TEXT NOT NULL DEFAULT 'PENDING';

-- Ensure identity_number has unique constraint (if not already unique)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'customers_identity_number_key'
    ) THEN
        ALTER TABLE customers ADD CONSTRAINT customers_identity_number_key UNIQUE (identity_number);
    END IF;
END $$;

-- Status check constraint for customers
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'customers_status_check'
    ) THEN
        ALTER TABLE customers ADD CONSTRAINT customers_status_check CHECK (
            status IN ('DRAFT', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED', 'SUSPENDED', 'BLACKLISTED')
        );
    END IF;
END $$;

-- License status check constraint
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'customers_license_status_check'
    ) THEN
        ALTER TABLE customers ADD CONSTRAINT customers_license_status_check CHECK (
            license_status IN ('PENDING', 'VALID', 'EXPIRED', 'REJECTED')
        );
    END IF;
END $$;

-- 3. Customer Documents table
CREATE TABLE IF NOT EXISTS customer_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    document_number TEXT,
    file_path TEXT NOT NULL,
    file_name TEXT,
    file_size_bytes BIGINT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT customer_document_type_check CHECK (
        document_type IN ('KTP', 'SIM', 'PASSPORT', 'OTHER')
    ),
    CONSTRAINT customer_document_status_check CHECK (
        status IN ('PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED')
    )
);

-- 4. Customer Agreements table (Versioned agreements acceptance)
CREATE TABLE IF NOT EXISTS customer_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    agreement_type TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT 'v1.0',
    status TEXT NOT NULL DEFAULT 'PENDING',
    accepted_at TIMESTAMPTZ,
    accepted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT customer_agreement_type_check CHECK (
        agreement_type IN ('RENTAL_TERMS', 'PRIVACY_POLICY', 'LIABILITY')
    ),
    CONSTRAINT customer_agreement_status_check CHECK (
        status IN ('PENDING', 'ACCEPTED', 'REJECTED')
    ),
    CONSTRAINT customer_agreement_unique_version UNIQUE (customer_id, agreement_type, version)
);

-- 5. Reservations table
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_number TEXT NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    rental_type TEXT NOT NULL DEFAULT 'B2C',
    vehicle_class TEXT,
    assigned_vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    pickup_location TEXT NOT NULL DEFAULT 'Pool Jakarta Pusat',
    dropoff_location TEXT NOT NULL DEFAULT 'Pool Jakarta Pusat',
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT',
    with_driver BOOLEAN NOT NULL DEFAULT false,
    assigned_driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    contract_id UUID,
    rental_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT reservation_date_check CHECK (start_at < end_at),
    CONSTRAINT reservation_rental_type_check CHECK (rental_type IN ('B2C', 'B2B')),
    CONSTRAINT reservation_status_check CHECK (
        status IN (
            'DRAFT',
            'PENDING_CUSTOMER_VERIFICATION',
            'PENDING_APPROVAL',
            'APPROVED',
            'REJECTED',
            'CANCELLED',
            'EXPIRED',
            'CONVERTED'
        )
    )
);

-- 6. Rental Charges table (Itemized billing breakdown)
CREATE TABLE IF NOT EXISTS rental_charges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rental_id UUID NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
    charge_type TEXT NOT NULL,
    description TEXT NOT NULL,
    quantity NUMERIC NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC NOT NULL,
    amount NUMERIC NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT rental_charge_type_check CHECK (
        charge_type IN (
            'RENTAL',
            'DRIVER',
            'DELIVERY',
            'INSURANCE',
            'EXTRA_TIME',
            'FUEL',
            'DAMAGE',
            'OTHER',
            'DISCOUNT'
        )
    )
);

-- 7. Payment Foundation: rental_payments
CREATE TABLE IF NOT EXISTS rental_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rental_id UUID NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
    payment_number TEXT NOT NULL UNIQUE,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    payment_method TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'PENDING',
    paid_at TIMESTAMPTZ,
    reference TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT rental_payment_status_check CHECK (
        payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')
    )
);

-- 8. Deposit Foundation: rental_deposits
CREATE TABLE IF NOT EXISTS rental_deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rental_id UUID NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL CHECK (amount >= 0),
    status TEXT NOT NULL DEFAULT 'HELD',
    received_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    returned_at TIMESTAMPTZ,
    returned_amount NUMERIC NOT NULL DEFAULT 0,
    deduction_amount NUMERIC NOT NULL DEFAULT 0,
    deduction_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT rental_deposit_status_check CHECK (
        status IN ('HELD', 'PARTIALLY_RETURNED', 'RETURNED', 'FORFEITED')
    ),
    CONSTRAINT rental_deposit_balance_check CHECK (
        returned_amount + deduction_amount <= amount
    )
);

-- 9. Generic Audit Trail table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    actor_name TEXT,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_customers_customer_number ON customers(customer_number);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customer_documents_customer_id ON customer_documents(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_documents_status ON customer_documents(status);
CREATE INDEX IF NOT EXISTS idx_customer_agreements_customer_id ON customer_agreements(customer_id);
CREATE INDEX IF NOT EXISTS idx_reservations_customer_id ON reservations(customer_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(start_at, end_at);
CREATE INDEX IF NOT EXISTS idx_reservations_vehicle ON reservations(assigned_vehicle_id);
CREATE INDEX IF NOT EXISTS idx_rental_charges_rental_id ON rental_charges(rental_id);
CREATE INDEX IF NOT EXISTS idx_rental_payments_rental_id ON rental_payments(rental_id);
CREATE INDEX IF NOT EXISTS idx_rental_deposits_rental_id ON rental_deposits(rental_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

