-- ==============================================================================
-- 017_views.sql
-- High-Performance Analytical Views for Jaja-Rent Operations Cockpit
-- ==============================================================================

-- 1. Fleet Status Distribution Summary
CREATE OR REPLACE VIEW fleet_summary AS
SELECT
    COUNT(*)::INTEGER AS total,
    COUNT(*) FILTER (WHERE status = 'AVAILABLE')::INTEGER AS available,
    COUNT(*) FILTER (WHERE status = 'RENTED')::INTEGER AS rented,
    COUNT(*) FILTER (WHERE status = 'RESERVED')::INTEGER AS reserved,
    COUNT(*) FILTER (WHERE status = 'MAINTENANCE')::INTEGER AS maintenance,
    COUNT(*) FILTER (WHERE status = 'INSPECTION')::INTEGER AS inspection,
    COUNT(*) FILTER (WHERE status = 'DOCUMENT_HOLD')::INTEGER AS document_hold,
    COUNT(*) FILTER (WHERE status = 'INACTIVE')::INTEGER AS inactive,
    COUNT(*) FILTER (WHERE ownership_type = 'JAJA')::INTEGER AS jaja_owned,
    COUNT(*) FILTER (WHERE ownership_type = 'VENDOR')::INTEGER AS vendor_owned
FROM vehicles;

-- 2. Corporate Fleet Status & Shortage View
CREATE OR REPLACE VIEW corporate_fleet_status AS
SELECT
    c.id AS contract_id,
    c.contract_number,
    cust.id AS corporate_customer_id,
    cust.company_name AS customer_name,
    c.status AS contract_status,
    c.start_date,
    c.end_date,
    c.monthly_billing_amount,
    c.required_vehicle_count AS required_units,
    COUNT(a.id)::INTEGER AS allocated_units,
    COUNT(a.id) FILTER (WHERE a.status = 'ACTIVE' AND a.is_replacement = false)::INTEGER AS operational_units,
    COUNT(a.id) FILTER (WHERE a.status = 'MAINTENANCE')::INTEGER AS maintenance_units,
    COUNT(a.id) FILTER (WHERE a.is_replacement = true)::INTEGER AS replacement_units,
    GREATEST(
        0, 
        c.required_vehicle_count - (
            COUNT(a.id) FILTER (WHERE a.status = 'ACTIVE' AND a.is_replacement = false) + 
            COUNT(a.id) FILTER (WHERE a.is_replacement = true)
        )
    )::INTEGER AS shortage_count,
    CASE 
        WHEN (c.required_vehicle_count - (
            COUNT(a.id) FILTER (WHERE a.status = 'ACTIVE' AND a.is_replacement = false) + 
            COUNT(a.id) FILTER (WHERE a.is_replacement = true)
        )) > 0 THEN true 
        ELSE false 
    END AS replacement_required
FROM corporate_contracts c
JOIN corporate_customers cust ON c.corporate_customer_id = cust.id
LEFT JOIN contract_vehicle_allocations a ON c.id = a.contract_id AND a.status != 'COMPLETED'
GROUP BY c.id, c.contract_number, cust.id, cust.company_name, c.status, c.start_date, c.end_date, c.monthly_billing_amount, c.required_vehicle_count;

-- 3. Document Expiry Compliance Summary View
CREATE OR REPLACE VIEW document_expiry_summary AS
SELECT
    COUNT(*) FILTER (WHERE expiry_date < CURRENT_DATE)::INTEGER AS expired,
    COUNT(*) FILTER (WHERE expiry_date >= CURRENT_DATE AND expiry_date <= CURRENT_DATE + INTERVAL '7 days')::INTEGER AS expires_7_days,
    COUNT(*) FILTER (WHERE expiry_date > CURRENT_DATE + INTERVAL '7 days' AND expiry_date <= CURRENT_DATE + INTERVAL '30 days')::INTEGER AS expires_30_days,
    COUNT(*) FILTER (WHERE expiry_date > CURRENT_DATE + INTERVAL '30 days' AND expiry_date <= CURRENT_DATE + INTERVAL '90 days')::INTEGER AS expires_90_days,
    COUNT(*) FILTER (WHERE expiry_date > CURRENT_DATE + INTERVAL '90 days')::INTEGER AS active_valid
FROM vehicle_documents;

-- 4. Vehicle Operational Master Summary View
CREATE OR REPLACE VIEW vehicle_operational_summary AS
SELECT
    v.id,
    v.police_number,
    v.brand,
    v.model,
    v.variant,
    v.year,
    v.color,
    v.transmission,
    v.fuel_type,
    v.seat_capacity,
    v.vin,
    v.engine_number,
    v.ownership_type,
    vend.name AS vendor_name,
    v.status,
    v.current_odometer,
    v.next_service_odometer,
    v.business_b2c_enabled,
    v.business_b2b_enabled,
    v.daily_rate_b2c,
    v.monthly_rate_b2b,
    v.location_city,
    v.location_area,
    v.current_location_lat,
    v.current_location_lng,
    v.last_gps_update,
    -- Document Health Calculation
    CASE
        WHEN EXISTS (SELECT 1 FROM vehicle_documents d WHERE d.vehicle_id = v.id AND d.expiry_date < CURRENT_DATE) THEN 'EXPIRED'
        WHEN EXISTS (SELECT 1 FROM vehicle_documents d WHERE d.vehicle_id = v.id AND d.expiry_date <= CURRENT_DATE + INTERVAL '30 days') THEN 'EXPIRING_SOON'
        ELSE 'OK'
    END AS document_health,
    -- Maintenance Health Calculation
    CASE
        WHEN v.status = 'MAINTENANCE' THEN 'IN_PROGRESS'
        WHEN v.next_service_odometer IS NOT NULL AND v.current_odometer >= v.next_service_odometer THEN 'OVERDUE'
        WHEN v.next_service_odometer IS NOT NULL AND (v.next_service_odometer - v.current_odometer) <= 1000 THEN 'DUE'
        ELSE 'OK'
    END AS maintenance_health,
    -- Active Deployment Information
    r.id AS current_rental_id,
    r.rental_number AS current_rental_number,
    r.rental_type AS current_rental_type,
    CASE 
        WHEN r.rental_type = 'B2B' THEN corp.company_name
        WHEN r.rental_type = 'B2C' THEN b2c_cust.full_name
        ELSE NULL
    END AS current_customer_name,
    drv.name AS current_driver_name
FROM vehicles v
LEFT JOIN vendors vend ON v.vendor_id = vend.id
LEFT JOIN rental_vehicles rv ON v.id = rv.vehicle_id AND rv.returned_at IS NULL AND rv.status = 'ACTIVE'
LEFT JOIN rentals r ON rv.rental_id = r.id AND r.status = 'ACTIVE'
LEFT JOIN corporate_customers corp ON r.corporate_customer_id = corp.id
LEFT JOIN customers b2c_cust ON r.customer_id = b2c_cust.id
LEFT JOIN drivers drv ON r.driver_id = drv.id;

