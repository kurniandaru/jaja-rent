-- ==============================================================================
-- 020_rbac_rls_hardening.sql
-- Jaja Rent Phase 1: RBAC & Row Level Security (RLS) Hardening
-- Revoke insecure public anon policies and enforce strict role-based access
-- ==============================================================================

-- 1. Enable RLS on newly created Phase 1 tables
ALTER TABLE customer_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Drop all insecure public anon read policies from 018_rls.sql
DROP POLICY IF EXISTS "Allow anon read access to vehicles" ON vehicles;
DROP POLICY IF EXISTS "Allow anon read access to vendors" ON vendors;
DROP POLICY IF EXISTS "Allow anon read access to customers" ON customers;
DROP POLICY IF EXISTS "Allow anon read access to corporate_customers" ON corporate_customers;
DROP POLICY IF EXISTS "Allow anon read access to drivers" ON drivers;
DROP POLICY IF EXISTS "Allow anon read access to corporate_contracts" ON corporate_contracts;
DROP POLICY IF EXISTS "Allow anon read access to contract_vehicle_requirements" ON contract_vehicle_requirements;
DROP POLICY IF EXISTS "Allow anon read access to rentals" ON rentals;
DROP POLICY IF EXISTS "Allow anon read access to rental_vehicles" ON rental_vehicles;
DROP POLICY IF EXISTS "Allow anon read access to contract_vehicle_allocations" ON contract_vehicle_allocations;
DROP POLICY IF EXISTS "Allow anon read access to inspections" ON inspections;
DROP POLICY IF EXISTS "Allow anon read access to inspection_items" ON inspection_items;
DROP POLICY IF EXISTS "Allow anon read access to maintenance_records" ON maintenance_records;
DROP POLICY IF EXISTS "Allow anon read access to maintenance_items" ON maintenance_items;
DROP POLICY IF EXISTS "Allow anon read access to vehicle_documents" ON vehicle_documents;
DROP POLICY IF EXISTS "Allow anon read access to gps_devices" ON gps_devices;
DROP POLICY IF EXISTS "Allow anon read access to gps_locations" ON gps_locations;
DROP POLICY IF EXISTS "Allow anon read access to vehicle_history" ON vehicle_history;

-- 3. Helper function to fetch current authenticated user's role from profiles
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT role::text FROM profiles WHERE id = auth.uid();
$$;

-- 4. Granular Role-Based Security Policies

-- A. ADMIN: Full access to everything
CREATE POLICY "Admin full access customer_documents" ON customer_documents FOR ALL TO authenticated
    USING (current_user_role() = 'ADMIN') WITH CHECK (current_user_role() = 'ADMIN');

CREATE POLICY "Admin full access customer_agreements" ON customer_agreements FOR ALL TO authenticated
    USING (current_user_role() = 'ADMIN') WITH CHECK (current_user_role() = 'ADMIN');

CREATE POLICY "Admin full access reservations" ON reservations FOR ALL TO authenticated
    USING (current_user_role() = 'ADMIN') WITH CHECK (current_user_role() = 'ADMIN');

CREATE POLICY "Admin full access rental_charges" ON rental_charges FOR ALL TO authenticated
    USING (current_user_role() = 'ADMIN') WITH CHECK (current_user_role() = 'ADMIN');

CREATE POLICY "Admin full access rental_payments" ON rental_payments FOR ALL TO authenticated
    USING (current_user_role() = 'ADMIN') WITH CHECK (current_user_role() = 'ADMIN');

CREATE POLICY "Admin full access rental_deposits" ON rental_deposits FOR ALL TO authenticated
    USING (current_user_role() = 'ADMIN') WITH CHECK (current_user_role() = 'ADMIN');

CREATE POLICY "Admin full access audit_logs" ON audit_logs FOR ALL TO authenticated
    USING (current_user_role() = 'ADMIN') WITH CHECK (current_user_role() = 'ADMIN');

-- B. OPERATIONS: Customer, Documents, Agreements, Reservations, Rentals, Fleet
CREATE POLICY "Operations manage customers" ON customers FOR ALL TO authenticated
    USING (current_user_role() IN ('ADMIN', 'OPERATIONS', 'FLEET', 'MANAGER'))
    WITH CHECK (current_user_role() IN ('ADMIN', 'OPERATIONS', 'FLEET', 'MANAGER'));

CREATE POLICY "Operations manage customer_documents" ON customer_documents FOR ALL TO authenticated
    USING (current_user_role() IN ('ADMIN', 'OPERATIONS', 'MANAGER'))
    WITH CHECK (current_user_role() IN ('ADMIN', 'OPERATIONS', 'MANAGER'));

CREATE POLICY "Operations manage customer_agreements" ON customer_agreements FOR ALL TO authenticated
    USING (current_user_role() IN ('ADMIN', 'OPERATIONS', 'MANAGER'))
    WITH CHECK (current_user_role() IN ('ADMIN', 'OPERATIONS', 'MANAGER'));

CREATE POLICY "Operations manage reservations" ON reservations FOR ALL TO authenticated
    USING (current_user_role() IN ('ADMIN', 'OPERATIONS', 'SALES', 'MANAGER'))
    WITH CHECK (current_user_role() IN ('ADMIN', 'OPERATIONS', 'SALES', 'MANAGER'));

CREATE POLICY "Operations manage rentals" ON rentals FOR ALL TO authenticated
    USING (current_user_role() IN ('ADMIN', 'OPERATIONS', 'FLEET', 'MANAGER'))
    WITH CHECK (current_user_role() IN ('ADMIN', 'OPERATIONS', 'FLEET', 'MANAGER'));

-- C. FINANCE: Billing, Charges, Payments, Deposits, Settlement
CREATE POLICY "Finance manage rental_charges" ON rental_charges FOR ALL TO authenticated
    USING (current_user_role() IN ('ADMIN', 'FINANCE', 'OPERATIONS', 'MANAGER'))
    WITH CHECK (current_user_role() IN ('ADMIN', 'FINANCE', 'MANAGER'));

CREATE POLICY "Finance manage rental_payments" ON rental_payments FOR ALL TO authenticated
    USING (current_user_role() IN ('ADMIN', 'FINANCE', 'MANAGER'))
    WITH CHECK (current_user_role() IN ('ADMIN', 'FINANCE', 'MANAGER'));

CREATE POLICY "Finance manage rental_deposits" ON rental_deposits FOR ALL TO authenticated
    USING (current_user_role() IN ('ADMIN', 'FINANCE', 'OPERATIONS', 'MANAGER'))
    WITH CHECK (current_user_role() IN ('ADMIN', 'FINANCE', 'MANAGER'));

-- D. WORKSHOP & INSPECTOR: Maintenance & Inspection
CREATE POLICY "Workshop manage maintenance" ON maintenance_records FOR ALL TO authenticated
    USING (current_user_role() IN ('ADMIN', 'WORKSHOP', 'MAINTENANCE', 'OPERATIONS', 'MANAGER'))
    WITH CHECK (current_user_role() IN ('ADMIN', 'WORKSHOP', 'MAINTENANCE'));

CREATE POLICY "Inspector manage inspections" ON inspections FOR ALL TO authenticated
    USING (current_user_role() IN ('ADMIN', 'INSPECTOR', 'OPERATIONS', 'MANAGER'))
    WITH CHECK (current_user_role() IN ('ADMIN', 'INSPECTOR'));

-- E. ALL AUTHENTICATED STAFF: Read audit logs & Append entries
CREATE POLICY "Staff read audit_logs" ON audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff insert audit_logs" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);

