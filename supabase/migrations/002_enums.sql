-- ==============================================================================
-- 002_enums.sql
-- PostgreSQL Enum Types for Jaja-Rent Fleet Operations
-- ==============================================================================

DO $$ BEGIN
    CREATE TYPE vehicle_ownership_type AS ENUM ('JAJA', 'VENDOR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE vehicle_status AS ENUM (
        'ONBOARDING',
        'INSPECTION',
        'AVAILABLE',
        'RESERVED',
        'RENTED',
        'RETURNING',
        'MAINTENANCE',
        'DOCUMENT_HOLD',
        'INACTIVE'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE rental_type AS ENUM ('B2C', 'B2B');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE rental_status AS ENUM (
        'RESERVED',
        'ACTIVE',
        'RETURNING',
        'COMPLETED',
        'CANCELLED',
        'OVERDUE'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE contract_status AS ENUM (
        'DRAFT',
        'ACTIVE',
        'EXPIRING',
        'COMPLETED',
        'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE billing_cycle_type AS ENUM (
        'MONTHLY',
        'QUARTERLY',
        'YEARLY',
        'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE inspection_type AS ENUM (
        'INITIAL',
        'PRE_RENTAL',
        'PERIODIC',
        'RETURN',
        'MAINTENANCE'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE inspection_result AS ENUM (
        'PASSED',
        'FAILED',
        'CONDITIONAL'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE maintenance_status AS ENUM (
        'SCHEDULED',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_type AS ENUM (
        'STNK',
        'KIR',
        'INSURANCE',
        'TAX',
        'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_status AS ENUM (
        'ACTIVE',
        'EXPIRING_SOON',
        'EXPIRED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE customer_type AS ENUM ('INDIVIDUAL', 'CORPORATE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE allocation_status AS ENUM (
        'ALLOCATED',
        'ACTIVE',
        'MAINTENANCE',
        'REPLACEMENT_REQUIRED',
        'REPLACED',
        'COMPLETED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'ADMIN',
        'OPERATIONS',
        'FLEET',
        'MAINTENANCE',
        'INSPECTOR',
        'SALES',
        'MANAGER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

