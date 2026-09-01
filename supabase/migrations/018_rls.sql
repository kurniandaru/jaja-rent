-- ==============================================================================
-- 018_rls.sql
-- Row Level Security (RLS) & User Profile Roles Architecture
-- ==============================================================================

-- 1. Profiles Table for Internal Staff & Role Management
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'OPERATIONS',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Enable Row Level Security (RLS) across all business tables
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_vehicle_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_vehicle_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE gps_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE gps_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Standard Operational Policies (Authenticated Operators have full access)
CREATE POLICY "Allow authenticated staff full access to vehicles" ON vehicles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated staff full access to vendors" ON vendors FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated staff full access to customers" ON customers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated staff full access to corporate_customers" ON corporate_customers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated staff full access to drivers" ON drivers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated staff full access to corporate_contracts" ON corporate_contracts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated staff full access to contract_vehicle_requirements" ON contract_vehicle_requirements FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated staff full access to rentals" ON rentals FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated staff full access to rental_vehicles" ON rental_vehicles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated staff full access to contract_vehicle_allocations" ON contract_vehicle_allocations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated staff full access to inspections" ON inspections FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated staff full access to inspection_items" ON inspection_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated staff full access to maintenance_records" ON maintenance_records FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated staff full access to maintenance_items" ON maintenance_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated staff full access to vehicle_documents" ON vehicle_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated staff full access to gps_devices" ON gps_devices FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated staff full access to gps_locations" ON gps_locations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated staff full access to vehicle_history" ON vehicle_history FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated staff to read profiles" ON profiles FOR SELECT TO authenticated USING (true);

-- 4. Public Anon Read Policies for Internal Operations Demo / Prototype
CREATE POLICY "Allow anon read access to vehicles" ON vehicles FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access to vendors" ON vendors FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access to customers" ON customers FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access to corporate_customers" ON corporate_customers FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access to drivers" ON drivers FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access to corporate_contracts" ON corporate_contracts FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access to contract_vehicle_requirements" ON contract_vehicle_requirements FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access to rentals" ON rentals FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access to rental_vehicles" ON rental_vehicles FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access to contract_vehicle_allocations" ON contract_vehicle_allocations FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access to inspections" ON inspections FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access to inspection_items" ON inspection_items FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access to maintenance_records" ON maintenance_records FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access to maintenance_items" ON maintenance_items FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access to vehicle_documents" ON vehicle_documents FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access to gps_devices" ON gps_devices FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access to gps_locations" ON gps_locations FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read access to vehicle_history" ON vehicle_history FOR SELECT TO anon USING (true);

