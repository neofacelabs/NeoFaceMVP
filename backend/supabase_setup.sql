-- =============================================================================
-- NeoFace Supabase Unified Initialization Script (Cleaned Up)
-- Schema definitions matching SQLAlchemy models, excluding unused modules:
--   - bank_accounts (REMOVED)
--   - transactions (REMOVED)
--   - transaction_biometric_details (REMOVED)
--   - liveness_logs (REMOVED)
--   - emotion_logs (REMOVED)
--   - headpose_logs (REMOVED)
--   - deepfake_logs (REMOVED)
-- =============================================================================

-- Enable PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. Database Table DDL Definitions
-- =============================================================================

-- 1. Organizations
CREATE TABLE IF NOT EXISTS organizations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name character varying(255) NOT NULL,
    slug character varying(100) UNIQUE NOT NULL,
    plan character varying(50) NOT NULL DEFAULT 'free',
    status character varying(50) NOT NULL DEFAULT 'active',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 2. Users
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name character varying(255) NOT NULL,
    email character varying(320) UNIQUE NOT NULL,
    phone character varying(20),
    hashed_password character varying(255),
    role character varying(20) NOT NULL DEFAULT 'user',
    is_active boolean NOT NULL DEFAULT true,
    is_enrolled boolean NOT NULL DEFAULT false,
    is_iris_enrolled boolean NOT NULL DEFAULT false,
    is_fingerprint_enrolled boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 3. Org Memberships
CREATE TABLE IF NOT EXISTS org_memberships (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role character varying(50) NOT NULL DEFAULT 'member',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT uq_org_memberships_org_user UNIQUE (organization_id, user_id)
);

-- 4. Applications (Projects)
CREATE TABLE IF NOT EXISTS applications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name character varying(255) NOT NULL,
    environment character varying(50) NOT NULL DEFAULT 'production',
    status character varying(50) NOT NULL DEFAULT 'active',
    description text,
    allowed_origins json,
    allowed_domains json,
    webhook_url character varying(255),
    rate_limit integer NOT NULL DEFAULT 100,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 5. AaaS API Keys
CREATE TABLE IF NOT EXISTS aaas_api_keys (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
    name character varying(255) NOT NULL,
    key_prefix character varying(12) NOT NULL,
    hashed_secret character varying(255) NOT NULL,
    scopes jsonb NOT NULL DEFAULT '[]'::jsonb,
    last_used_at timestamp with time zone,
    status character varying(50) NOT NULL DEFAULT 'active',
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 6. Face Embeddings
CREATE TABLE IF NOT EXISTS face_embeddings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    embedding_vector double precision[] NOT NULL,
    embedding_version character varying(50) NOT NULL DEFAULT 'arcface_r100_v1',
    embedding_dimension integer NOT NULL DEFAULT 512,
    quality_score double precision,
    source_image_path character varying(500),
    source_image_bytes bytea,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 7. Iris Embeddings
CREATE TABLE IF NOT EXISTS iris_embeddings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    iris_code bytea NOT NULL,
    iris_mask bytea,
    eye_side character varying(5) NOT NULL,
    iris_radius_px integer,
    pupil_radius_px integer,
    quality_score double precision,
    usable_bits_ratio double precision,
    algorithm_version character varying(50) NOT NULL,
    source_image_path character varying(500),
    source_image_bytes bytea,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 8. Fingerprint Templates
CREATE TABLE IF NOT EXISTS fingerprint_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_data bytea NOT NULL,
    finger_position integer NOT NULL,
    finger_position_label character varying(30),
    minutiae_count integer,
    quality_score double precision,
    ridge_density double precision,
    capture_device character varying(100),
    capture_dpi integer,
    impression_type character varying(20) NOT NULL,
    algorithm_version character varying(50) NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    source_image_bytes bytea
);

-- 9. Identities
CREATE TABLE IF NOT EXISTS identities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    external_user_id character varying(255) NOT NULL,
    enrollment_status character varying(50) NOT NULL DEFAULT 'pending',
    face_embedding_id uuid REFERENCES face_embeddings(id) ON DELETE SET NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 10. Authentication Sessions
CREATE TABLE IF NOT EXISTS authentication_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    identity_id uuid REFERENCES identities(id) ON DELETE CASCADE,
    event_type character varying(50) NOT NULL,
    status character varying(50) NOT NULL,
    confidence_score double precision,
    risk_score double precision,
    ip_address character varying(45),
    device_fingerprint character varying(512),
    latency_ms integer,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 11. Biometric Credentials
CREATE TABLE IF NOT EXISTS biometric_credentials (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    credential_id bytea NOT NULL,
    public_key bytea NOT NULL,
    sign_count bigint NOT NULL,
    aaguid character varying(36),
    device_name character varying(120) NOT NULL,
    device_metadata jsonb,
    is_active boolean NOT NULL DEFAULT true,
    fingerprint_payments_enabled boolean NOT NULL DEFAULT true,
    enrolled_at timestamp with time zone NOT NULL DEFAULT now(),
    last_used_at timestamp with time zone
);

-- 12. Auth Logs
CREATE TABLE IF NOT EXISTS auth_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    confidence_score double precision,
    liveness_score double precision,
    authentication_result boolean NOT NULL,
    failure_reason character varying(255),
    ip_address character varying(45),
    user_agent character varying(512),
    timestamp timestamp with time zone NOT NULL DEFAULT now()
);

-- 13. Enrollment Logs
CREATE TABLE IF NOT EXISTS enrollment_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    images_submitted integer NOT NULL DEFAULT 0,
    images_accepted integer NOT NULL DEFAULT 0,
    avg_quality_score double precision,
    status character varying(20) NOT NULL DEFAULT 'failed',
    error_message character varying(500),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 14. Verification Logs
CREATE TABLE IF NOT EXISTS verification_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    liveness_score double precision,
    anti_spoof_score double precision,
    confidence_score double precision,
    result character varying(20) NOT NULL DEFAULT 'failed',
    method character varying(100),
    ip_address character varying(45),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 15. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
    action character varying(100) NOT NULL,
    resource_type character varying(100),
    resource_id character varying(255),
    metadata jsonb,
    ip_address character varying(45),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 16. Merchants
CREATE TABLE IF NOT EXISTS merchants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name character varying(255) NOT NULL,
    business_email character varying(320) UNIQUE NOT NULL,
    business_category character varying(100),
    website_url character varying(500),
    description text,
    api_key_hash character varying(255) UNIQUE,
    api_key_prefix character varying(12),
    is_verified boolean NOT NULL DEFAULT false,
    is_active boolean NOT NULL DEFAULT true,
    is_sandbox boolean NOT NULL DEFAULT true,
    settlement_account character varying(255),
    default_currency character varying(3) NOT NULL DEFAULT 'USD',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    verified_at timestamp with time zone
);

-- 17. Liveness Logs (OMITTED)
-- 18. Emotion Logs (OMITTED)
-- 19. Headpose Logs (OMITTED)
-- 20. Deepfake Logs (OMITTED)

-- 21. Behavior Profiles
CREATE TABLE IF NOT EXISTS behavior_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    avg_mouse_speed double precision,
    avg_mouse_curvature double precision,
    avg_hesitation_rate double precision,
    avg_typing_speed_wpm double precision,
    avg_dwell_time_ms double precision,
    avg_flight_time_ms double precision,
    avg_swipe_velocity double precision,
    avg_touch_pressure double precision,
    avg_gesture_rhythm double precision,
    total_events integer NOT NULL DEFAULT 0,
    profile_version integer NOT NULL DEFAULT 1,
    is_baseline_established boolean NOT NULL DEFAULT false,
    model_data jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 22. Behavior Events
CREATE TABLE IF NOT EXISTS behavior_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid NOT NULL REFERENCES behavior_profiles(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type character varying(30) NOT NULL,
    metrics jsonb NOT NULL,
    is_anomalous boolean NOT NULL DEFAULT false,
    anomaly_score double precision,
    session_id character varying(255),
    ip_address character varying(45),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 23. Device Trust Logs
CREATE TABLE IF NOT EXISTS device_trust_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    device_id character varying(255),
    device_platform character varying(20),
    device_trust_score integer NOT NULL,
    is_rooted boolean NOT NULL DEFAULT false,
    is_emulator boolean NOT NULL DEFAULT false,
    is_jailbroken boolean NOT NULL DEFAULT false,
    is_virtual_camera boolean NOT NULL DEFAULT false,
    is_headless_browser boolean NOT NULL DEFAULT false,
    is_automation_detected boolean NOT NULL DEFAULT false,
    is_usb_debugging boolean NOT NULL DEFAULT false,
    signals jsonb,
    user_agent character varying(500),
    ip_address character varying(45),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 24. Risk Scores
CREATE TABLE IF NOT EXISTS risk_scores (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    session_id character varying(255),
    transaction_id uuid, -- Reference kept nullable without FK constraint since transactions table is removed
    face_score double precision,
    liveness_score double precision,
    deepfake_score double precision,
    behavior_score double precision,
    device_trust_score double precision,
    location_trust_score double precision,
    fingerprint_trust_score double precision,
    final_trust_score double precision NOT NULL,
    decision character varying(20) NOT NULL,
    weights_snapshot jsonb,
    ip_address character varying(45),
    device_id character varying(255),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 25. Continuous Sessions
CREATE TABLE IF NOT EXISTS continuous_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token character varying(255) UNIQUE NOT NULL,
    status character varying(20) NOT NULL DEFAULT 'active',
    started_at timestamp with time zone NOT NULL DEFAULT now(),
    last_verified_at timestamp with time zone,
    terminated_at timestamp with time zone,
    termination_reason character varying(255),
    current_trust_score double precision NOT NULL DEFAULT 100.0,
    reauth_count integer NOT NULL DEFAULT 0,
    check_interval_seconds integer NOT NULL DEFAULT 30,
    device_id character varying(255),
    ip_address character varying(45),
    user_agent character varying(500),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 26. Challenge Logs
CREATE TABLE IF NOT EXISTS challenge_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    session_id character varying(255),
    challenge_type character varying(200) NOT NULL,
    challenge_steps jsonb,
    is_completed boolean NOT NULL DEFAULT false,
    is_passed boolean NOT NULL DEFAULT false,
    completion_time_ms integer,
    failure_reason character varying(255),
    challenge_nonce character varying(64),
    expires_at timestamp with time zone,
    ip_address character varying(45),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 27. Usage Records
CREATE TABLE IF NOT EXISTS usage_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
    endpoint character varying(100) NOT NULL,
    bucket_date date NOT NULL,
    request_count integer NOT NULL DEFAULT 0,
    success_count integer NOT NULL DEFAULT 0,
    failure_count integer NOT NULL DEFAULT 0,
    avg_latency_ms double precision NOT NULL DEFAULT 0.0,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 28. Audit Events
CREATE TABLE IF NOT EXISTS audit_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
    actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
    event_type character varying(100) NOT NULL,
    entity_type character varying(100),
    entity_id character varying(255),
    metadata jsonb,
    ip_address character varying(45),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 29. Webhook Endpoints
CREATE TABLE IF NOT EXISTS webhook_endpoints (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
    url text NOT NULL,
    signing_secret character varying(255) NOT NULL,
    events jsonb NOT NULL DEFAULT '[]'::jsonb,
    status character varying(50) NOT NULL DEFAULT 'active',
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 30. Webhook Deliveries
CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint_id uuid NOT NULL REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
    event_type character varying(100) NOT NULL,
    payload jsonb NOT NULL,
    status character varying(50) NOT NULL DEFAULT 'pending',
    http_status integer,
    attempts integer NOT NULL DEFAULT 0,
    next_retry_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 31. Model Versions
CREATE TABLE IF NOT EXISTS model_versions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name character varying(100) NOT NULL,
    version character varying(50) NOT NULL,
    accuracy double precision,
    far double precision,
    frr double precision,
    latency_ms integer,
    status character varying(50) NOT NULL DEFAULT 'active',
    deployed_at timestamp with time zone NOT NULL DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 32. Waitlist Entries
CREATE TABLE IF NOT EXISTS waitlist_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email character varying(255) NOT NULL,
    feature character varying(100) NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);


-- =============================================================================
-- 2. Database Indexes
-- =============================================================================

CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);
CREATE INDEX IF NOT EXISTS ix_users_role ON users(role);
CREATE INDEX IF NOT EXISTS ix_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS ix_face_embeddings_user_id ON face_embeddings(user_id);
CREATE INDEX IF NOT EXISTS ix_face_embeddings_version ON face_embeddings(embedding_version);
CREATE INDEX IF NOT EXISTS ix_org_memberships_organization_id ON org_memberships(organization_id);
CREATE INDEX IF NOT EXISTS ix_org_memberships_user_id ON org_memberships(user_id);
CREATE INDEX IF NOT EXISTS ix_applications_organization_id ON applications(organization_id);
CREATE INDEX IF NOT EXISTS ix_aaas_api_keys_organization_id ON aaas_api_keys(organization_id);
CREATE INDEX IF NOT EXISTS ix_aaas_api_keys_application_id ON aaas_api_keys(application_id);
CREATE INDEX IF NOT EXISTS ix_aaas_api_keys_key_prefix ON aaas_api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS ix_identities_organization_id ON identities(organization_id);
CREATE INDEX IF NOT EXISTS ix_identities_application_id ON identities(application_id);
CREATE INDEX IF NOT EXISTS ix_identities_external_user_id ON identities(external_user_id);
CREATE INDEX IF NOT EXISTS ix_identities_face_embedding_id ON identities(face_embedding_id);
CREATE INDEX IF NOT EXISTS ix_authentication_sessions_organization_id ON authentication_sessions(organization_id);
CREATE INDEX IF NOT EXISTS ix_authentication_sessions_application_id ON authentication_sessions(application_id);
CREATE INDEX IF NOT EXISTS ix_authentication_sessions_identity_id ON authentication_sessions(identity_id);
CREATE INDEX IF NOT EXISTS ix_authentication_sessions_event_type ON authentication_sessions(event_type);
CREATE INDEX IF NOT EXISTS ix_authentication_sessions_status ON authentication_sessions(status);
CREATE INDEX IF NOT EXISTS ix_authentication_sessions_created_at ON authentication_sessions(created_at);
CREATE INDEX IF NOT EXISTS ix_usage_records_organization_id ON usage_records(organization_id);
CREATE INDEX IF NOT EXISTS ix_usage_records_application_id ON usage_records(application_id);
CREATE INDEX IF NOT EXISTS ix_audit_events_organization_id ON audit_events(organization_id);
CREATE INDEX IF NOT EXISTS ix_audit_events_application_id ON audit_events(application_id);
CREATE INDEX IF NOT EXISTS ix_audit_events_actor_id ON audit_events(actor_id);
CREATE INDEX IF NOT EXISTS ix_webhook_endpoints_organization_id ON webhook_endpoints(organization_id);
CREATE INDEX IF NOT EXISTS ix_webhook_endpoints_application_id ON webhook_endpoints(application_id);
CREATE INDEX IF NOT EXISTS ix_webhook_deliveries_endpoint_id ON webhook_deliveries(endpoint_id);
CREATE INDEX IF NOT EXISTS ix_fingerprint_templates_user_id ON fingerprint_templates(user_id);
CREATE INDEX IF NOT EXISTS ix_iris_embeddings_user_id ON iris_embeddings(user_id);
CREATE INDEX IF NOT EXISTS ix_merchants_business_email ON merchants(business_email);
CREATE INDEX IF NOT EXISTS ix_merchants_api_key_hash ON merchants(api_key_hash);
CREATE INDEX IF NOT EXISTS ix_behavior_profiles_user_id ON behavior_profiles(user_id);
CREATE INDEX IF NOT EXISTS ix_continuous_sessions_session_token ON continuous_sessions(session_token);


-- =============================================================================
-- 3. Supabase Storage Setup & Security Policies
-- =============================================================================

-- Create storage buckets if they do not exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('face-images', 'face-images', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('verification-images', 'verification-images', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('logs', 'logs', false, 52428800, NULL)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Service Role Admin Access" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own face images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own face images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own face images" ON storage.objects;
DROP POLICY IF EXISTS "Admins have full access to logs" ON storage.objects;
DROP POLICY IF EXISTS "Admins have full access to verification-images" ON storage.objects;

-- Define Row Level Security (RLS) Policies

-- Policy A: Face Images - Select (Authenticated users can read their own face images)
CREATE POLICY "Users can read own face images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'face-images' 
  AND (name LIKE 'users/' || auth.uid()::text || '/%')
);

-- Policy B: Face Images - Insert (Authenticated users can upload to their own directory)
CREATE POLICY "Users can upload own face images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'face-images' 
  AND (name LIKE 'users/' || auth.uid()::text || '/%')
);

-- Policy C: Face Images - Delete (Authenticated users can clean up their own directory)
CREATE POLICY "Users can delete own face images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'face-images' 
  AND (name LIKE 'users/' || auth.uid()::text || '/%')
);

-- Policy D: Logs - Full Access for Admins (Only users with 'admin' role claims)
CREATE POLICY "Admins have full access to logs"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'logs'
  AND (auth.jwt() ->> 'role' = 'admin')
)
WITH CHECK (
  bucket_id = 'logs'
  AND (auth.jwt() ->> 'role' = 'admin')
);

-- Policy E: Verification Images - Admin Access (Read/Write verification frames)
CREATE POLICY "Admins have full access to verification-images"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'verification-images'
  AND (auth.jwt() ->> 'role' = 'admin')
)
WITH CHECK (
  bucket_id = 'verification-images'
  AND (auth.jwt() ->> 'role' = 'admin')
);
