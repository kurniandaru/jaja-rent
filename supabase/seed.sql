-- ==============================================================================
-- Jaja-Rent Fleet Operations Platform — Supabase Seed Data
-- 30 Vehicles, 10 Corporate Clients, 10 B2C Customers, 10 Drivers, 5 Contracts,
-- Multi-Point Inspections, Workshop Logs, Documents, GPS Telemetry & Audit Trail
-- ==============================================================================

-- 1. Vendors (Fleet Asset Partners)
INSERT INTO vendors (id, name, company_name, phone, email, address, contact_person, tax_id, status) VALUES
('11111111-1111-1111-1111-111111111101', 'Mitra Armada', 'PT Mitra Armada Nusantara', '021-5550101', 'ops@mitraarmada.co.id', 'Jl. Daan Mogot No. 88, Jakarta Barat', 'Rudi Hermawan', '01.234.567.8-012.000', 'ACTIVE'),
('11111111-1111-1111-1111-111111111102', 'Surya Rental', 'PT Surya Rental Perkasa', '021-5550102', 'fleet@suryarental.id', 'Jl. RE Martadinata No. 12, Jakarta Utara', 'Surya Adiputra', '02.345.678.9-013.000', 'ACTIVE'),
('11111111-1111-1111-1111-111111111103', 'Mandiri Fleet', 'PT Mandiri Fleet Prima', '021-5550103', 'contact@mandirifleet.co.id', 'Kawasan Industri GIIC Blok AA-3, Cikarang', 'Bambang Irawan', '03.456.789.0-014.000', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 2. B2C Individual Customers
INSERT INTO customers (id, customer_type, full_name, phone, email, identity_type, identity_number, address) VALUES
('22222222-2222-2222-2222-222222222201', 'INDIVIDUAL', 'Bambang Supriyadi', '0812-9988-1122', 'bambang.supriyadi@gmail.com', 'KTP', '3171012304850001', 'Jl. Tebet Barat Dalam No. 14, Jakarta Selatan'),
('22222222-2222-2222-2222-222222222202', 'INDIVIDUAL', 'Siti Rahmawati', '0813-8877-2233', 'siti.rahma@yahoo.com', 'KTP', '3172021508900002', 'Jl. Kelapa Gading Boulevard Blok WA2 No. 5, Jakarta Utara'),
('22222222-2222-2222-2222-222222222203', 'INDIVIDUAL', 'Hendra Setiawan', '0811-7766-3344', 'hendra.setiawan@outlook.com', 'KTP', '3173031002880003', 'Jl. Kebon Jeruk Raya No. 45, Jakarta Barat'),
('22222222-2222-2222-2222-222222222204', 'INDIVIDUAL', 'Dewi Lestari', '0815-6655-4455', 'dewi.lestari99@gmail.com', 'KTP', '3174042807920004', 'Jl. Cempaka Putih Tengah No. 20, Jakarta Pusat'),
('22222222-2222-2222-2222-222222222205', 'INDIVIDUAL', 'Budi Santoso', '0818-5544-5566', 'budi.santoso@gmail.com', 'KTP', '3175051909840005', 'Jl. Rawamangun Muka No. 8, Jakarta Timur'),
('22222222-2222-2222-2222-222222222206', 'INDIVIDUAL', 'Maya Anggraini', '0819-4433-6677', 'maya.anggraini@gmail.com', 'KTP', '3275010506930006', 'Kemang Pratama 3 Blok B No. 12, Bekasi'),
('22222222-2222-2222-2222-222222222207', 'INDIVIDUAL', 'Rizky Ramadhan', '0812-3322-7788', 'rizky.ramadhan@hotmail.com', 'KTP', '3674021403910007', 'Bintaro Jaya Sektor 9, Tangerang Selatan'),
('22222222-2222-2222-2222-222222222208', 'INDIVIDUAL', 'Putri Wulandari', '0813-2211-8899', 'putri.wulan@gmail.com', 'KTP', '3171022201950008', 'Jl. Radio Dalam No. 18, Jakarta Selatan'),
('22222222-2222-2222-2222-222222222209', 'INDIVIDUAL', 'Agus Prasetyo', '0811-1100-9900', 'agus.prasetyo@gmail.com', 'KTP', '3173010101820009', 'Jl. Tomang Raya No. 33, Jakarta Barat'),
('22222222-2222-2222-2222-222222222210', 'INDIVIDUAL', 'Farhan Maulana', '0817-0099-1122', 'farhan.m@gmail.com', 'KTP', '3174031908890010', 'Jl. Percetakan Negara No. 10, Jakarta Pusat')
ON CONFLICT (id) DO NOTHING;

-- 3. B2B Corporate Customers
INSERT INTO corporate_customers (id, company_name, company_registration_number, tax_id, industry, city, address, phone, email, pic_name, pic_role, pic_phone, pic_email, status) VALUES
('33333333-3333-3333-3333-333333333301', 'PT ABC Indonesia', 'AHU-0012345.AH.01.01.2018', '01.111.222.3-011.000', 'Financial Technology', 'Jakarta Selatan', 'Menara BCA Lt. 38, Jl. MH Thamrin No. 1', '021-23580000', 'procurement@abc-indonesia.co.id', 'Dian Sastro', 'General Affairs Manager', '0811-2233-4455', 'dian.sastro@abc-indonesia.co.id', 'ACTIVE'),
('33333333-3333-3333-3333-333333333302', 'PT Maju Bersama Logistik', 'AHU-0023456.AH.01.01.2019', '01.222.333.4-012.000', 'Supply Chain & Logistics', 'Jakarta Utara', 'Jl. Raya Pelabuhan No. 88, Tanjung Priok', '021-43901234', 'fleet@majubersama.com', 'Bambang Tri', 'Fleet Director', '0812-3344-5566', 'bambang.tri@majubersama.com', 'ACTIVE'),
('33333333-3333-3333-3333-333333333303', 'PT Nusantara Mining Services', 'AHU-0034567.AH.01.01.2017', '01.333.444.5-013.000', 'Energy & Mining', 'Jakarta Selatan', 'Gedung Wisma Mulia 2 Lt. 21, Jl. Gatot Subroto', '021-52901111', 'ops@nusantaramining.co.id', 'Iwan Fals', 'Operational Head', '0813-4455-6677', 'iwan.fals@nusantaramining.co.id', 'ACTIVE'),
('33333333-3333-3333-3333-333333333304', 'PT Mitra Abadi Retail', 'AHU-0045678.AH.01.01.2020', '01.444.555.6-014.000', 'Retail & FMCG', 'Jakarta Barat', 'Puri Indah Financial Tower Lt. 15', '021-58302222', 'ga@mitraabadi.co.id', 'Ratna Sari', 'Head of Procurement', '0815-5566-7788', 'ratna.sari@mitraabadi.co.id', 'ACTIVE'),
('33333333-3333-3333-3333-333333333305', 'PT Telko Kreasi Utama', 'AHU-0056789.AH.01.01.2016', '01.555.666.7-015.000', 'Telecommunications', 'Jakarta Pusat', 'Telko Hub Tower, Jl. Kebon Sirih No. 12', '021-3908888', 'vendor@telkokreasi.id', 'Denny Sumargo', 'Infrastructure Lead', '0818-6677-8899', 'denny.s@telkokreasi.id', 'ACTIVE'),
('33333333-3333-3333-3333-333333333306', 'PT Sinar Surya Express', 'AHU-0067890.AH.01.01.2021', '01.666.777.8-016.000', 'Courier & Express Cargo', 'Tangerang', 'CBD Bintaro Blok B-05, Pondok Aren', '021-7459000', 'logistics@sinarsurya.id', 'Lukman Hakim', 'Transport Manager', '0812-7788-9900', 'lukman@sinarsurya.id', 'ACTIVE'),
('33333333-3333-3333-3333-333333333307', 'PT Astra Multi Finance', 'AHU-0078901.AH.01.01.2015', '01.777.888.9-017.000', 'Financial Services', 'Jakarta Selatan', 'Menara Astra Lt. 19, Jl. Jend. Sudirman Kav. 5', '021-50801000', 'fleet.corp@astrafinance.co.id', 'Aris Munandar', 'GA Senior Specialist', '0811-8899-0011', 'aris.m@astrafinance.co.id', 'ACTIVE'),
('33333333-3333-3333-3333-333333333308', 'PT Danarta Finansial', 'AHU-0089012.AH.01.01.2022', '01.888.999.0-018.000', 'Investment Banking', 'Jakarta Selatan', 'Equity Tower Lt. 28, SCBD Sudirman', '021-5158800', 'corporate.affairs@danarta.co.id', 'Maya Estianty', 'HR & Facilities Lead', '0813-9900-1122', 'maya.e@danarta.co.id', 'ACTIVE'),
('33333333-3333-3333-3333-333333333309', 'PT Globalindo Transport', 'AHU-0090123.AH.01.01.2019', '01.999.000.1-019.000', 'Passenger Transport', 'Bekasi', 'Ruko Emerald Summarecon Bekasi Blok UG-12', '021-88997700', 'ops@globalindo.co.id', 'Rendy Kjaernett', 'Operations Coordinator', '0817-1122-3344', 'rendy@globalindo.co.id', 'ACTIVE'),
('33333333-3333-3333-3333-333333333310', 'PT Indo Prima Distribusi', 'AHU-0101234.AH.01.01.2020', '02.000.111.2-020.000', 'FMCG Distribution', 'Jakarta Barat', 'Kawasan Daan Mogot KM 19 Blok C-4', '021-5438800', 'procurement@indoprima.co.id', 'Surya Saputra', 'Procurement VP', '0818-2233-4455', 'surya.s@indoprima.co.id', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 4. Drivers
INSERT INTO drivers (id, name, phone, license_number, license_type, license_expiry, status) VALUES
('44444444-4444-4444-4444-444444444401', 'Ahmad Subarjo', '0812-1111-0001', 'SIM-3171-8899001', 'SIM A', '2028-08-15', 'ASSIGNED'),
('44444444-4444-4444-4444-444444444402', 'Joko Susilo', '0812-1111-0002', 'SIM-3172-8899002', 'SIM A', '2027-11-20', 'ASSIGNED'),
('44444444-4444-4444-4444-444444444403', 'Hendra Wijaya', '0812-1111-0003', 'SIM-3173-8899003', 'SIM B1', '2029-01-10', 'ASSIGNED'),
('44444444-4444-4444-4444-444444444404', 'Supriadi', '0812-1111-0004', 'SIM-3174-8899004', 'SIM A', '2027-05-14', 'ASSIGNED'),
('44444444-4444-4444-4444-444444444405', 'Wahyu Hidayat', '0812-1111-0005', 'SIM-3175-8899005', 'SIM A', '2028-09-30', 'ASSIGNED'),
('44444444-4444-4444-4444-444444444406', 'Agus Pramono', '0812-1111-0006', 'SIM-3275-8899006', 'SIM A', '2028-03-22', 'AVAILABLE'),
('44444444-4444-4444-4444-444444444407', 'Rizal Pratama', '0812-1111-0007', 'SIM-3674-8899007', 'SIM A', '2027-12-05', 'AVAILABLE'),
('44444444-4444-4444-4444-444444444408', 'Doni Saputra', '0812-1111-0008', 'SIM-3171-8899008', 'SIM B1', '2029-06-18', 'AVAILABLE'),
('44444444-4444-4444-4444-444444444409', 'Dedi Irawan', '0812-1111-0009', 'SIM-3173-8899009', 'SIM A', '2028-02-14', 'OFF_DUTY'),
('44444444-4444-4444-4444-444444444410', 'Eko Prasetyo', '0812-1111-0010', 'SIM-3174-8899010', 'SIM A', '2027-10-09', 'OFF_DUTY')
ON CONFLICT (id) DO NOTHING;

-- 5. Vehicles (30 Units: 20 Jaja Owned + 10 Vendor Owned)
INSERT INTO vehicles (id, police_number, brand, model, variant, year, color, transmission, fuel_type, seat_capacity, vin, engine_number, ownership_type, vendor_id, status, current_odometer, next_service_odometer, business_b2c_enabled, business_b2b_enabled, daily_rate_b2c, monthly_rate_b2b, location_city, location_area, current_location_lat, current_location_lng, last_gps_update) VALUES
-- Jaja Owned (20 Units)
('55555555-5555-5555-5555-555555555501', 'B 1234 XYZ', 'Toyota', 'Innova Zenix 2.0 V', 'Hybrid', 2024, 'Attitude Black', 'Automatic', 'Hybrid', 7, 'MHF11AA23P000101', 'M20A-FXS-00101', 'JAJA', NULL, 'AVAILABLE', 45210, 50000, true, true, 850000, 14500000, 'Jakarta Pusat', 'Thamrin Pool', -6.193400, 106.823100, NOW()),
('55555555-5555-5555-5555-555555555502', 'B 2345 ABC', 'Toyota', 'Veloz 1.5 Q CVT', 'TSS', 2023, 'Platinum White Pearl', 'Automatic', 'Bensin', 7, 'MHF11AA23P000102', '2NR-VE-00102', 'JAJA', NULL, 'RENTED', 32400, 40000, true, true, 550000, 9500000, 'Jakarta Selatan', 'SCBD Sudirman', -6.225100, 106.809500, NOW()),
('55555555-5555-5555-5555-555555555503', 'B 3456 DEF', 'Toyota', 'Fortuner 2.8 VRZ', 'GR Sport 4x2', 2023, 'Super White', 'Automatic', 'Diesel', 7, 'MHF11AA23P000103', '1GD-FTV-00103', 'JAJA', NULL, 'RENTED', 58120, 60000, true, true, 1200000, 22000000, 'Jakarta Selatan', 'TB Simatupang Office', -6.294100, 106.821900, NOW()),
('55555555-5555-5555-5555-555555555504', 'B 4567 GHI', 'Mitsubishi', 'Xpander Ultimate', 'CVT', 2023, 'Graphite Gray Metallic', 'Automatic', 'Bensin', 7, 'MHF11AA23P000104', '4A91-00104', 'JAJA', NULL, 'RENTED', 28900, 30000, true, true, 500000, 8500000, 'Bekasi', 'Kawasan GIIC Cikarang', -6.368800, 107.165400, NOW()),
('55555555-5555-5555-5555-555555555505', 'B 5678 JKL', 'Hyundai', 'Stargazer Prime', 'IVT 6-Seater', 2023, 'Magnetic Silver Metallic', 'Automatic', 'Bensin', 6, 'MHF11AA23P000105', 'Smartstream-G1.5', 'JAJA', NULL, 'AVAILABLE', 19800, 25000, true, true, 520000, 8800000, 'Jakarta Pusat', 'Monas Standby Hub', -6.175400, 106.827200, NOW()),
('55555555-5555-5555-5555-555555555506', 'B 6789 MNO', 'Toyota', 'Avanza 1.5 G CVT', 'Standard', 2023, 'Silver Mica Metallic', 'Automatic', 'Bensin', 7, 'MHF11AA23P000106', '2NR-VE-00106', 'JAJA', NULL, 'RENTED', 41200, 50000, true, true, 450000, 7500000, 'Jakarta Timur', 'Rawamangun District', -6.195500, 106.882100, NOW()),
('55555555-5555-5555-5555-555555555507', 'B 7890 PQR', 'Toyota', 'HiAce Commuter 2.5', 'Manual', 2022, 'Silver Metallic', 'Manual', 'Diesel', 16, 'MHF11AA23P000107', '2KD-FTV-00107', 'JAJA', NULL, 'RENTED', 94500, 100000, true, true, 1100000, 19500000, 'Tangerang', 'Bandara Soetta Cargo', -6.127500, 106.653700, NOW()),
('55555555-5555-5555-5555-555555555508', 'B 8901 STU', 'Toyota', 'Innova Reborn 2.4 G', 'Diesel A/T', 2022, 'Phantom Brown', 'Automatic', 'Diesel', 7, 'MHF11AA23P000108', '2GD-FTV-00108', 'JAJA', NULL, 'AVAILABLE', 71200, 80000, true, true, 700000, 12000000, 'Jakarta Barat', 'Kebon Jeruk Dispatch', -6.189500, 106.772300, NOW()),
('55555555-5555-5555-5555-555555555509', 'B 9012 VWX', 'Honda', 'HR-V 1.5 SE', 'CVT', 2023, 'Sand Khaki Pearl', 'Automatic', 'Bensin', 5, 'MHF11AA23P000109', 'L15ZF-00109', 'JAJA', NULL, 'AVAILABLE', 22100, 30000, true, true, 650000, 11000000, 'Jakarta Selatan', 'Kemang Fleet Standby', -6.262500, 106.815200, NOW()),
('55555555-5555-5555-5555-555555555510', 'B 1122 AAA', 'Toyota', 'Innova Zenix 2.0 Q', 'Hybrid Modelista', 2024, 'Dark Steel Mica', 'Automatic', 'Hybrid', 7, 'MHF11AA23P000110', 'M20A-FXS-00110', 'JAJA', NULL, 'RESERVED', 15400, 20000, true, true, 950000, 16000000, 'Jakarta Pusat', 'Thamrin Pool', -6.193400, 106.823100, NOW()),
('55555555-5555-5555-5555-555555555511', 'B 2233 BBB', 'Toyota', 'Veloz 1.5 Q CVT', 'TSS', 2023, 'Black Metallic', 'Automatic', 'Bensin', 7, 'MHF11AA23P000111', '2NR-VE-00111', 'JAJA', NULL, 'AVAILABLE', 36200, 40000, true, true, 550000, 9500000, 'Jakarta Utara', 'Kelapa Gading Hub', -6.158200, 106.908500, NOW()),
('55555555-5555-5555-5555-555555555512', 'B 3344 CCC', 'Mitsubishi', 'Xpander Cross', 'Premium CVT', 2023, 'Sunrise Orange Metallic', 'Automatic', 'Bensin', 7, 'MHF11AA23P000112', '4A91-00112', 'JAJA', NULL, 'RENTED', 31100, 40000, true, true, 550000, 9200000, 'Jakarta Selatan', 'Kuningan Cyber 2', -6.229700, 106.831500, NOW()),
('55555555-5555-5555-5555-555555555513', 'B 4455 DDD', 'Toyota', 'Avanza 1.3 E M/T', 'Manual', 2022, 'White', 'Manual', 'Bensin', 7, 'MHF11AA23P000113', '1NR-VE-00113', 'JAJA', NULL, 'MAINTENANCE', 64800, 65000, true, true, 400000, 6500000, 'Jakarta Timur', 'AutoCare Pulogadung', -6.191200, 106.912500, NOW()),
('55555555-5555-5555-5555-555555555514', 'B 5566 EEE', 'Toyota', 'Innova Reborn 2.4 V', 'Diesel A/T', 2023, 'Super White', 'Automatic', 'Diesel', 7, 'MHF11AA23P000114', '2GD-FTV-00114', 'JAJA', NULL, 'RENTED', 48900, 50000, true, true, 750000, 13000000, 'Jakarta Pusat', 'Menteng Executive Area', -6.195500, 106.835100, NOW()),
('55555555-5555-5555-5555-555555555515', 'B 6677 FFF', 'Wuling', 'Air EV Long Range', 'Electric', 2023, 'Pristine White', 'Automatic', 'Electric', 4, 'MHF11AA23P000115', 'TZ180XS-00115', 'JAJA', NULL, 'AVAILABLE', 12400, 20000, true, true, 400000, 6800000, 'Jakarta Pusat', 'Thamrin Pool EV Station', -6.193400, 106.823100, NOW()),
('55555555-5555-5555-5555-555555555516', 'B 7788 GGG', 'Toyota', 'Alphard 2.5 G', 'A/T Executive', 2023, 'Black', 'Automatic', 'Bensin', 7, 'MHF11AA23P000116', '2AR-FE-00116', 'JAJA', NULL, 'RENTED', 38200, 40000, true, true, 2500000, 42000000, 'Jakarta Selatan', 'Senayan Golf Residence', -6.222500, 106.799500, NOW()),
('55555555-5555-5555-5555-555555555517', 'B 8899 KLU', 'Toyota', 'Innova Reborn 2.4 G', 'Diesel A/T', 2022, 'Attitude Black', 'Automatic', 'Diesel', 7, 'MHF11AA23P000117', '2GD-FTV-00117', 'JAJA', NULL, 'MAINTENANCE', 82421, 85000, true, true, 700000, 12000000, 'Jakarta Timur', 'AutoCare Pulogadung', -6.191200, 106.912500, NOW()),
('55555555-5555-5555-5555-555555555518', 'B 9900 III', 'Hyundai', 'Ioniq 5 Signature', 'Long Range EV', 2023, 'Gravity Gold Matte', 'Automatic', 'Electric', 5, 'MHF11AA23P000118', 'EM17-00118', 'JAJA', NULL, 'AVAILABLE', 16500, 20000, true, true, 1300000, 24000000, 'Jakarta Selatan', 'SCBD EV Charger Station', -6.225100, 106.809500, NOW()),
('55555555-5555-5555-5555-555555555519', 'B 1010 JJJ', 'Toyota', 'Veloz 1.5 Q CVT', 'TSS', 2024, 'Dark Red Metallic', 'Automatic', 'Bensin', 7, 'MHF11AA23P000119', '2NR-VE-00119', 'JAJA', NULL, 'INSPECTION', 8900, 10000, true, true, 550000, 9500000, 'Jakarta Pusat', 'Thamrin Inspection Bay', -6.193400, 106.823100, NOW()),
('55555555-5555-5555-5555-555555555520', 'B 2020 KKK', 'Toyota', 'Innova Zenix 2.0 G', 'CVT Gas', 2024, 'Silver Metallic', 'Automatic', 'Bensin', 7, 'MHF11AA23P000120', 'M20A-FKS-00120', 'JAJA', NULL, 'AVAILABLE', 14200, 20000, true, true, 750000, 13000000, 'Jakarta Barat', 'Kebon Jeruk Dispatch', -6.189500, 106.772300, NOW()),

-- Vendor Owned (10 Units: B2B Enabled ONLY, B2C Disabled)
('55555555-5555-5555-5555-555555555521', 'B 3030 LLL', 'Toyota', 'Innova Reborn 2.4 G', 'Diesel A/T', 2022, 'Silver Metallic', 'Automatic', 'Diesel', 7, 'MHF11AA23P000121', '2GD-FTV-00121', 'VENDOR', '11111111-1111-1111-1111-111111111101', 'RENTED', 62300, 70000, false, true, NULL, 11500000, 'Jakarta Utara', 'Tanjung Priok Logistics', -6.118900, 106.883400, NOW()),
('55555555-5555-5555-5555-555555555522', 'B 4040 MMM', 'Toyota', 'Fortuner 2.4 G 4x2', 'Diesel M/T', 2022, 'Attitude Black', 'Manual', 'Diesel', 7, 'MHF11AA23P000122', '2GD-FTV-00122', 'VENDOR', '11111111-1111-1111-1111-111111111101', 'RENTED', 78900, 80000, false, true, NULL, 18000000, 'Jakarta Selatan', 'Gatot Subroto Mining Hub', -6.238400, 106.831500, NOW()),
('55555555-5555-5555-5555-555555555523', 'B 5050 NNN', 'Mitsubishi', 'Pajero Sport Dakar', '4x2 A/T', 2023, 'White Pearl', 'Automatic', 'Diesel', 7, 'MHF11AA23P000123', '4N15-00123', 'VENDOR', '11111111-1111-1111-1111-111111111102', 'RENTED', 44100, 50000, false, true, NULL, 21000000, 'Jakarta Pusat', 'Thamrin Executive Tower', -6.193400, 106.823100, NOW()),
('55555555-5555-5555-5555-555555555524', 'B 6060 OOO', 'Toyota', 'HiAce Premio 2.8', 'Executive 12-Seat', 2023, 'White', 'Manual', 'Diesel', 12, 'MHF11AA23P000124', '1GD-FTV-00124', 'VENDOR', '11111111-1111-1111-1111-111111111102', 'RENTED', 51200, 60000, false, true, NULL, 24000000, 'Tangerang', 'Bintaro Jaya Corporate Hub', -6.281200, 106.721500, NOW()),
('55555555-5555-5555-5555-555555555525', 'B 7070 PPP', 'Toyota', 'Innova Zenix 2.0 V', 'CVT Gasoline', 2024, 'Attitude Black', 'Automatic', 'Bensin', 7, 'MHF11AA23P000125', 'M20A-FKS-00125', 'VENDOR', '11111111-1111-1111-1111-111111111103', 'AVAILABLE', 18400, 20000, false, true, NULL, 13500000, 'Jakarta Pusat', 'Thamrin Pool Standby', -6.193400, 106.823100, NOW()),
('55555555-5555-5555-5555-555555555526', 'B 8080 QQQ', 'Toyota', 'Avanza 1.5 G CVT', 'Standard', 2023, 'Black Metallic', 'Automatic', 'Bensin', 7, 'MHF11AA23P000126', '2NR-VE-00126', 'VENDOR', '11111111-1111-1111-1111-111111111103', 'RENTED', 38900, 40000, false, true, NULL, 7200000, 'Bekasi', 'Summarecon Bekasi Business', -6.225500, 106.998200, NOW()),
('55555555-5555-5555-5555-555555555527', 'B 9090 RRR', 'Mitsubishi', 'Xpander Exceed', 'CVT', 2023, 'Blade Silver Metallic', 'Automatic', 'Bensin', 7, 'MHF11AA23P000127', '4A91-00127', 'VENDOR', '11111111-1111-1111-1111-111111111101', 'RENTED', 29400, 30000, false, true, NULL, 8000000, 'Jakarta Barat', 'Daan Mogot Distribution', -6.155400, 106.712300, NOW()),
('55555555-5555-5555-5555-555555555528', 'B 1212 SSS', 'Toyota', 'Innova Reborn 2.4 G', 'Diesel A/T', 2022, 'Super White', 'Automatic', 'Diesel', 7, 'MHF11AA23P000128', '2GD-FTV-00128', 'VENDOR', '11111111-1111-1111-1111-111111111102', 'AVAILABLE', 71500, 80000, false, true, NULL, 11500000, 'Jakarta Barat', 'Kebon Jeruk Dispatch', -6.189500, 106.772300, NOW()),
('55555555-5555-5555-5555-555555555529', 'B 2323 TTT', 'Toyota', 'Hilux Double Cabin 2.4', '4x4 V A/T', 2023, 'Super White', 'Automatic', 'Diesel', 5, 'MHF11AA23P000129', '2GD-FTV-00129', 'VENDOR', '11111111-1111-1111-1111-111111111103', 'DOCUMENT_HOLD', 49200, 50000, false, true, NULL, 17500000, 'Jakarta Timur', 'Pulogadung Storage Bay', -6.191200, 106.912500, NOW()),
('55555555-5555-5555-5555-555555555530', 'B 3434 UUU', 'Isuzu', 'MU-X 1.9 4x4', 'A/T', 2023, 'Splash White', 'Automatic', 'Diesel', 7, 'MHF11AA23P000130', 'RZ4E-TC-00130', 'VENDOR', '11111111-1111-1111-1111-111111111101', 'AVAILABLE', 31200, 40000, false, true, NULL, 19000000, 'Jakarta Pusat', 'Thamrin Pool Standby', -6.193400, 106.823100, NOW())
ON CONFLICT (id) DO NOTHING;

-- 6. Corporate Master Contracts
INSERT INTO corporate_contracts (id, contract_number, corporate_customer_id, start_date, end_date, status, billing_cycle, monthly_billing_amount, payment_term, required_vehicle_count, notes) VALUES
('66666666-6666-6666-6666-666666666601', 'CTR-2026-001', '33333333-3333-3333-3333-333333333301', '2026-01-01', '2026-12-31', 'ACTIVE', 'MONTHLY', 145000000, 'Net 30 Days', 10, 'Master Operational Lease Agreement for Executive & General Fleet. SLA includes 24h replacement guarantee.'),
('66666666-6666-6666-6666-666666666602', 'CTR-2026-002', '33333333-3333-3333-3333-333333333302', '2025-06-01', '2027-05-31', 'ACTIVE', 'MONTHLY', 210000000, 'Net 30 Days', 15, 'Port & Cargo operational utility fleet.'),
('66666666-6666-6666-6666-666666666603', 'CTR-2026-003', '33333333-3333-3333-3333-333333333303', '2026-02-01', '2027-01-31', 'ACTIVE', 'MONTHLY', 180000000, 'Net 45 Days', 8, 'Heavy duty 4x4 and SUV executive fleet for mining management.'),
('66666666-6666-6666-6666-666666666604', 'CTR-2026-004', '33333333-3333-3333-3333-333333333304', '2025-09-01', '2026-09-30', 'EXPIRING', 'MONTHLY', 95000000, 'Net 15 Days', 6, 'Retail store supervisor operational vehicles. Renewal in progress.'),
('66666666-6666-6666-6666-666666666605', 'CTR-2026-005', '33333333-3333-3333-3333-333333333305', '2026-03-01', '2027-02-28', 'ACTIVE', 'MONTHLY', 125000000, 'Net 30 Days', 8, 'Telecommunication site inspection engineering vehicles.')
ON CONFLICT (id) DO NOTHING;

-- 7. Contract Vehicle Allocations (With Unit B 8899 KLU in MAINTENANCE creating 1 Shortage on CTR-2026-001)
INSERT INTO contract_vehicle_allocations (id, contract_id, vehicle_id, allocated_at, deployed_at, status, is_replacement, replacement_for_allocation_id, notes) VALUES
-- Allocations for CTR-2026-001 (PT ABC Indonesia: Required = 10, Allocated = 10, Operational = 9, Maintenance = 1 -> Shortage = 1)
('77777777-7777-7777-7777-777777777701', '66666666-6666-6666-6666-666666666601', '55555555-5555-5555-5555-555555555502', '2026-01-01', '2026-01-02', 'ACTIVE', false, NULL, 'B 2345 ABC - Veloz Operational'),
('77777777-7777-7777-7777-777777777702', '66666666-6666-6666-6666-666666666601', '55555555-5555-5555-5555-555555555503', '2026-01-01', '2026-01-02', 'ACTIVE', false, NULL, 'B 3456 DEF - Fortuner VIP'),
('77777777-7777-7777-7777-777777777703', '66666666-6666-6666-6666-666666666601', '55555555-5555-5555-5555-555555555504', '2026-01-01', '2026-01-02', 'ACTIVE', false, NULL, 'B 4567 GHI - Xpander Operations'),
('77777777-7777-7777-7777-777777777704', '66666666-6666-6666-6666-666666666601', '55555555-5555-5555-5555-555555555506', '2026-01-01', '2026-01-02', 'ACTIVE', false, NULL, 'B 6789 MNO - Avanza Field Pool'),
('77777777-7777-7777-7777-777777777705', '66666666-6666-6666-6666-666666666601', '55555555-5555-5555-5555-555555555507', '2026-01-01', '2026-01-02', 'ACTIVE', false, NULL, 'B 7890 PQR - HiAce Shuttle'),
('77777777-7777-7777-7777-777777777706', '66666666-6666-6666-6666-666666666601', '55555555-5555-5555-5555-555555555512', '2026-01-01', '2026-01-02', 'ACTIVE', false, NULL, 'B 3344 CCC - Xpander Cross'),
('77777777-7777-7777-7777-777777777707', '66666666-6666-6666-6666-666666666601', '55555555-5555-5555-5555-555555555514', '2026-01-01', '2026-01-02', 'ACTIVE', false, NULL, 'B 5566 EEE - Innova Diesel'),
('77777777-7777-7777-7777-777777777708', '66666666-6666-6666-6666-666666666601', '55555555-5555-5555-5555-555555555516', '2026-01-01', '2026-01-02', 'ACTIVE', false, NULL, 'B 7788 GGG - Alphard BOD'),
('77777777-7777-7777-7777-777777777709', '66666666-6666-6666-6666-666666666601', '55555555-5555-5555-5555-555555555521', '2026-01-01', '2026-01-02', 'ACTIVE', false, NULL, 'B 3030 LLL (Vendor) - Innova Fleet'),
-- Maintenance vehicle causing Shortage on Contract 001:
('77777777-7777-7777-7777-777777777710', '66666666-6666-6666-6666-666666666601', '55555555-5555-5555-5555-555555555517', '2026-01-01', '2026-01-02', 'MAINTENANCE', false, NULL, 'B 8899 KLU - In workshop for brake overhaul. Requires replacement unit!')
ON CONFLICT (id) DO NOTHING;

-- 8. Rentals (Unified B2C & B2B records)
INSERT INTO rentals (id, rental_number, rental_type, customer_id, corporate_customer_id, contract_id, start_date, end_date, status, with_driver, driver_id, pickup_location, dropoff_location, total_amount, deposit_amount, notes) VALUES
-- B2C Rentals
('88888888-8888-8888-8888-888888888801', 'RNT-B2C-2026-089', 'B2C', '22222222-2222-2222-2222-222222222201', NULL, NULL, '2026-09-01', '2026-09-05', 'ACTIVE', true, '44444444-4444-4444-4444-444444444401', 'Thamrin Pool', 'Thamrin Pool', 4250000, 1000000, 'Family vacation rental with dedicated driver Ahmad Subarjo'),
('88888888-8888-8888-8888-888888888802', 'RNT-B2C-2026-090', 'B2C', '22222222-2222-2222-2222-222222222202', NULL, NULL, '2026-09-01', '2026-09-03', 'ACTIVE', false, NULL, 'Kelapa Gading Hub', 'Kelapa Gading Hub', 1650000, 500000, 'Self drive city rental'),
('88888888-8888-8888-8888-888888888803', 'RNT-B2C-2026-091', 'B2C', '22222222-2222-2222-2222-222222222203', NULL, NULL, '2026-09-02', '2026-09-07', 'RESERVED', true, '44444444-4444-4444-4444-444444444402', 'Kebon Jeruk Hub', 'Bandara Soetta', 5700000, 1500000, 'Bandung business trip with driver'),
-- B2B Rentals
('88888888-8888-8888-8888-888888888804', 'RNT-B2B-2026-044', 'B2B', NULL, '33333333-3333-3333-3333-333333333301', '66666666-6666-6666-6666-666666666601', '2026-01-01', '2026-12-31', 'ACTIVE', true, '44444444-4444-4444-4444-444444444403', 'Menara BCA Thamrin', 'Menara BCA Thamrin', 145000000, 0, 'Long-term corporate rent-to-rent agreement'),
('88888888-8888-8888-8888-888888888805', 'RNT-B2B-2026-045', 'B2B', NULL, '33333333-3333-3333-3333-333333333302', '66666666-6666-6666-6666-666666666602', '2025-06-01', '2027-05-31', 'ACTIVE', true, '44444444-4444-4444-4444-444444444404', 'Tanjung Priok Office', 'Tanjung Priok Office', 210000000, 0, 'Logistics cargo fleet dispatch')
ON CONFLICT (id) DO NOTHING;

-- 9. Rental Vehicles (Mapping Rental to Vehicle)
INSERT INTO rental_vehicles (id, rental_id, vehicle_id, assigned_at, starting_odometer, status) VALUES
('99999999-9999-9999-9999-999999999901', '88888888-8888-8888-8888-888888888801', '55555555-5555-5555-5555-555555555501', '2026-09-01', 45210, 'ACTIVE'),
('99999999-9999-9999-9999-999999999902', '88888888-8888-8888-8888-888888888802', '55555555-5555-5555-5555-555555555502', '2026-09-01', 32400, 'ACTIVE'),
('99999999-9999-9999-9999-999999999904', '88888888-8888-8888-8888-888888888804', '55555555-5555-5555-5555-555555555503', '2026-01-01', 58120, 'ACTIVE'),
('99999999-9999-9999-9999-999999999905', '88888888-8888-8888-8888-888888888805', '55555555-5555-5555-5555-555555555507', '2025-06-01', 94500, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 10. Inspections & Multi-Point Checklist
INSERT INTO inspections (id, vehicle_id, rental_id, inspection_type, inspection_date, inspector_name, odometer, result, notes) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', '55555555-5555-5555-5555-555555555501', '88888888-8888-8888-8888-888888888801', 'PRE_RENTAL', '2026-09-01', 'Ahmad Subarjo', 45210, 'PASSED', 'Vehicle in pristine condition, all fluids checked, ready for dispatch.'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02', '55555555-5555-5555-5555-555555555517', NULL, 'PERIODIC', '2026-08-30', 'Joko Susilo', 82421, 'FAILED', 'Brake pad wear detected below safety tolerance threshold (1.8mm). Dispatched to workshop.'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03', '55555555-5555-5555-5555-555555555519', NULL, 'INITIAL', '2026-09-01', 'Wahyu Hidayat', 8900, 'PASSED', 'Onboarding inspection passed with 100% compliance score.')
ON CONFLICT (id) DO NOTHING;

-- 11. Maintenance Records & Costs
INSERT INTO maintenance_records (id, vehicle_id, maintenance_type, status, scheduled_date, started_at, completed_at, odometer, next_service_odometer, workshop_name, workshop_location, description, cost, notes) VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', '55555555-5555-5555-5555-555555555517', 'REPAIR', 'IN_PROGRESS', '2026-08-31', NOW() - INTERVAL '1 day', NULL, 82421, 90000, 'AutoCare Pulogadung', 'Jakarta Timur', 'Complete front & rear brake rotor surfacing, pad replacement, and brake line fluid flush.', 3200000, 'High priority: Unit is contracted under PT ABC Indonesia.'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02', '55555555-5555-5555-5555-555555555513', 'PERIODIC_SERVICE', 'IN_PROGRESS', '2026-09-01', NOW(), NULL, 64800, 70000, 'Plaza Toyota Kebon Jeruk', 'Jakarta Barat', '60,000 KM major maintenance: Synthetic oil, spark plugs, air & cabin filter, transmission fluid.', 2150000, 'Expected completion in 24 hours.'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03', '55555555-5555-5555-5555-555555555501', 'PERIODIC_SERVICE', 'COMPLETED', '2026-08-10', '2026-08-10 09:00:00+07', '2026-08-10 14:30:00+07', 40000, 50000, 'Auto2000 Cikarang', 'Bekasi', '40,000 KM standard service: Oil change, tire rotation & alignment, battery diagnostic.', 1850000, 'Completed on schedule.')
ON CONFLICT (id) DO NOTHING;

-- 12. Vehicle Legal Documents (STNK, KIR, Insurance, Tax)
INSERT INTO vehicle_documents (id, vehicle_id, document_type, document_number, issued_date, expiry_date, cost_to_renew, notes) VALUES
('cccccccc-cccc-cccc-cccc-cccccccccc01', '55555555-5555-5555-5555-555555555501', 'STNK', 'STNK-09112233', '2022-09-15', '2027-09-15', 3800000, '5-year plate renewal valid until 2027'),
('cccccccc-cccc-cccc-cccc-cccccccccc02', '55555555-5555-5555-5555-555555555501', 'INSURANCE', 'POL-ASY-8877665', '2025-09-10', '2026-09-10', 4500000, 'Commercial All Risk insurance. Expiring in 9 days! Action Required.'),
('cccccccc-cccc-cccc-cccc-cccccccccc03', '55555555-5555-5555-5555-555555555529', 'KIR', 'KIR-JKT-998877', '2026-02-20', '2026-08-20', 350000, 'KIR Berkala expired on 20 Aug 2026! Vehicle held in storage bay until re-tested.'),
('cccccccc-cccc-cccc-cccc-cccccccccc04', '55555555-5555-5555-5555-555555555502', 'TAX', 'PKB-3171-445566', '2025-10-05', '2026-10-05', 4200000, 'Pajak tahunan valid until Oct 2026'),
('cccccccc-cccc-cccc-cccc-cccccccccc05', '55555555-5555-5555-5555-555555555503', 'STNK', 'STNK-09223344', '2023-03-12', '2028-03-12', 6500000, 'STNK valid until 2028')
ON CONFLICT (id) DO NOTHING;

-- 13. GPS Telemetry Devices & Real-Time Coordinates
INSERT INTO gps_devices (id, vehicle_id, device_serial, provider, status, installed_at) VALUES
('dddddddd-dddd-dddd-dddd-dddddddddd01', '55555555-5555-5555-5555-555555555501', 'TEL-FMB920-00101', 'Teltonika FMB920', 'ONLINE', '2024-01-10'),
('dddddddd-dddd-dddd-dddd-dddddddddd02', '55555555-5555-5555-5555-555555555502', 'TEL-FMB920-00102', 'Teltonika FMB920', 'ONLINE', '2023-05-15'),
('dddddddd-dddd-dddd-dddd-dddddddddd03', '55555555-5555-5555-5555-555555555503', 'TEL-FMB920-00103', 'Teltonika FMB920', 'ONLINE', '2023-08-20'),
('dddddddd-dddd-dddd-dddd-dddddddddd04', '55555555-5555-5555-5555-555555555504', 'TEL-FMB920-00104', 'Teltonika FMB920', 'ONLINE', '2023-04-12')
ON CONFLICT (id) DO NOTHING;

INSERT INTO gps_locations (id, vehicle_id, gps_device_id, latitude, longitude, speed, heading, odometer, battery_level, ignition, recorded_at) VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', '55555555-5555-5555-5555-555555555501', 'dddddddd-dddd-dddd-dddd-dddddddddd01', -6.193400, 106.823100, 0, 'North', 45210, 98, false, NOW()),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', '55555555-5555-5555-5555-555555555502', 'dddddddd-dddd-dddd-dddd-dddddddddd02', -6.225100, 106.809500, 48, 'South-East', 32400, 95, true, NOW()),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee03', '55555555-5555-5555-5555-555555555503', 'dddddddd-dddd-dddd-dddd-dddddddddd03', -6.294100, 106.821900, 62, 'South', 58120, 99, true, NOW()),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee04', '55555555-5555-5555-5555-555555555504', 'dddddddd-dddd-dddd-dddd-dddddddddd04', -6.368800, 107.165400, 75, 'East', 28900, 92, true, NOW())
ON CONFLICT (id) DO NOTHING;

-- 14. Vehicle Lifecycle Audit History
INSERT INTO vehicle_history (id, vehicle_id, event_type, event_date, title, reference_type, description, actor, odometer, tag) VALUES
('ffffffff-ffff-ffff-ffff-ffffffffff01', '55555555-5555-5555-5555-555555555501', 'RENTAL_START', NOW() - INTERVAL '1 hour', 'B2C Rental Dispatched', 'RENTAL', 'Vehicle dispatched to Bambang Supriyadi under agreement RNT-B2C-2026-089 with driver Ahmad Subarjo.', 'Dimas Ops', 45210, 'B2C RENTAL'),
('ffffffff-ffff-ffff-ffff-ffffffffff02', '55555555-5555-5555-5555-555555555501', 'INSPECTION', NOW() - INTERVAL '2 hours', 'Pre-Rental Inspection Passed', 'INSPECTION', 'Pre-rental physical inspection completed with 100% score.', 'Ahmad Subarjo', 45210, 'INSPECTION'),
('ffffffff-ffff-ffff-ffff-ffffffffff03', '55555555-5555-5555-5555-555555555501', 'MAINTENANCE', NOW() - INTERVAL '21 days', '40,000 KM Periodic Maintenance', 'MAINTENANCE', 'Periodic engine service and tire rotation completed at Auto2000 Cikarang.', 'Auto2000 Workshop', 40000, 'SERVICE'),
('ffffffff-ffff-ffff-ffff-ffffffffff04', '55555555-5555-5555-5555-555555555517', 'MAINTENANCE', NOW() - INTERVAL '1 day', 'Dispatched to Workshop for Brake Overhaul', 'MAINTENANCE', 'Unit entered AutoCare Pulogadung after failed periodic inspection.', 'Joko Susilo', 82421, 'CRITICAL MAINT'),
('ffffffff-ffff-ffff-ffff-ffffffffff05', '55555555-5555-5555-5555-555555555517', 'STATUS_CHANGE', NOW() - INTERVAL '1 day', 'Corporate Shortage Triggered', 'CONTRACT', 'SLA shortage triggered for contract CTR-2026-001 (PT ABC Indonesia). 1 replacement unit required.', 'System Auto-Monitor', 82421, 'SLA SHORTAGE')
ON CONFLICT (id) DO NOTHING;

