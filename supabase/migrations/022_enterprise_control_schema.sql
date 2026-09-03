-- ==============================================================================
-- 022_enterprise_control_schema.sql
-- Jaja Rent Phase 3: Enterprise Control, Notification & Integration Schema
-- Roles, Granular Permissions, Notifications, Integration Logs, and System Config
-- ==============================================================================

-- 1. Extend audit_logs table with enterprise metadata and audit context
DO $$ BEGIN
    ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS ip_address TEXT;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_agent TEXT;
EXCEPTION WHEN duplicate_column THEN null; END $$;

-- 2. Master Permissions Table
CREATE TABLE IF NOT EXISTS permissions (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    module VARCHAR(64) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Role Permissions Mapping Table
CREATE TABLE IF NOT EXISTS role_permissions (
    role TEXT NOT NULL,
    permission_id VARCHAR(64) NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (role, permission_id)
);

-- 4. Centralized Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id TEXT NOT NULL,
    type TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'INFO' CHECK (severity IN ('CRITICAL', 'WARNING', 'INFO')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    status TEXT NOT NULL DEFAULT 'UNREAD' CHECK (status IN ('UNREAD', 'READ')),
    event_key TEXT UNIQUE,
    action_url TEXT,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Notification Deliveries Queue Table
CREATE TABLE IF NOT EXISTS notification_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('IN_APP', 'EMAIL', 'TELEGRAM', 'WHATSAPP')),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED')),
    attempt_count INT NOT NULL DEFAULT 0,
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. External Integration & Webhook Logs Table
CREATE TABLE IF NOT EXISTS integration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL,
    event_type TEXT NOT NULL,
    external_id TEXT,
    status TEXT NOT NULL DEFAULT 'RECEIVED' CHECK (status IN ('RECEIVED', 'PROCESSING', 'SUCCESS', 'FAILED', 'RETRYING')),
    request_id TEXT,
    idempotency_key TEXT UNIQUE,
    payload_summary JSONB,
    response_summary JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    processed_at TIMESTAMPTZ
);

-- 7. System Operational Configurations Table
CREATE TABLE IF NOT EXISTS system_configurations (
    key VARCHAR(128) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'OPERATIONS',
    updated_by TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_status ON notifications (recipient_id, status);

CREATE INDEX IF NOT EXISTS idx_notifications_event_key ON notifications (event_key);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_deliveries_status ON notification_deliveries (status);

CREATE INDEX IF NOT EXISTS idx_integration_logs_provider_status ON integration_logs (provider, status);

CREATE INDEX IF NOT EXISTS idx_integration_logs_idempotency ON integration_logs (idempotency_key);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs (actor_name);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action);

-- 9. Seed System Configurations (Threshold Defaults)
INSERT INTO system_configurations (key, value, description, category) VALUES
    ('rental.return_reminder_hours', '24'::jsonb, 'Jam sebelum jadwal pengembalian untuk notifikasi reminder', 'RENTAL'),
    ('document.expiry_warning_days', '30'::jsonb, 'Hari sebelum STNK/KIR expired untuk alert kuning', 'FLEET'),
    ('maintenance.warning_days', '7'::jsonb, 'Hari sebelum jatuh tempo servis berkala', 'MAINTENANCE'),
    ('gps.offline_minutes', '30'::jsonb, 'Menit tanpa ping sebelum GPS ditandai OFFLINE', 'FLEET')
ON CONFLICT (key) DO NOTHING;

-- 10. Enable Row Level Security (RLS)
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

ALTER TABLE notification_deliveries ENABLE ROW LEVEL SECURITY;

ALTER TABLE integration_logs ENABLE ROW LEVEL SECURITY;

ALTER TABLE system_configurations ENABLE ROW LEVEL SECURITY;

-- 11. Strict Role-Based RLS Policies (Zero Public Anon Access)
CREATE POLICY "Auth users read permissions" ON permissions FOR
SELECT TO authenticated USING (true);

CREATE POLICY "Admin manage permissions" ON permissions FOR ALL TO authenticated USING (
    current_user_role () IN ('ADMIN', 'SUPER_ADMIN')
)
WITH
    CHECK (
        current_user_role () IN ('ADMIN', 'SUPER_ADMIN')
    );

CREATE POLICY "Auth users read role_permissions" ON role_permissions FOR
SELECT TO authenticated USING (true);

CREATE POLICY "Admin manage role_permissions" ON role_permissions FOR ALL TO authenticated USING (
    current_user_role () IN ('ADMIN', 'SUPER_ADMIN')
)
WITH
    CHECK (
        current_user_role () IN ('ADMIN', 'SUPER_ADMIN')
    );

CREATE POLICY "Users read own notifications" ON notifications FOR SELECT TO authenticated
    USING (
        recipient_id = auth.uid()::text 
        OR recipient_id = 'ALL' 
        OR recipient_id = current_user_role()
        OR current_user_role() IN ('ADMIN', 'SUPER_ADMIN')
    );

CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE TO authenticated
    USING (
        recipient_id = auth.uid()::text 
        OR recipient_id = 'ALL' 
        OR recipient_id = current_user_role()
        OR current_user_role() IN ('ADMIN', 'SUPER_ADMIN')
    )
    WITH CHECK (
        recipient_id = auth.uid()::text 
        OR recipient_id = 'ALL' 
        OR recipient_id = current_user_role()
        OR current_user_role() IN ('ADMIN', 'SUPER_ADMIN')
    );

CREATE POLICY "System insert notifications" ON notifications FOR
INSERT
    TO authenticated
WITH
    CHECK (true);

CREATE POLICY "Admin read integration_logs" ON integration_logs FOR
SELECT TO authenticated USING (
        current_user_role () IN (
            'ADMIN', 'SUPER_ADMIN', 'OPERATIONS', 'FINANCE'
        )
    );

CREATE POLICY "System insert integration_logs" ON integration_logs FOR
INSERT
    TO authenticated
WITH
    CHECK (true);

CREATE POLICY "Auth read system_configurations" ON system_configurations FOR
SELECT TO authenticated USING (true);

CREATE POLICY "Admin manage system_configurations" ON system_configurations FOR ALL TO authenticated USING (
    current_user_role () IN ('ADMIN', 'SUPER_ADMIN')
)
WITH
    CHECK (
        current_user_role () IN ('ADMIN', 'SUPER_ADMIN')
    );