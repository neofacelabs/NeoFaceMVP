// ══════════════════════════════════════════════════════════════════════════════
// NeoFace Cloud — Platform Types
// Multi-tenant, role-based enterprise identity management
// ══════════════════════════════════════════════════════════════════════════════

// ── Roles & Access ─────────────────────────────────────────────────────────────
export type UserRole = "super_admin" | "org_admin" | "member";

export type MemberType =
  | "student"
  | "faculty"
  | "staff"
  | "visitor"
  | "employee"
  | "contractor"
  | "resident"
  | "security_personnel"
  | "guest"
  | "vip"
  | "administrator";

// ── Project Templates ──────────────────────────────────────────────────────────
export type ProjectTemplate = "education" | "physical_security";

export type EducationSubcategory =
  | "campus_attendance"
  | "classroom_attendance"
  | "laboratory_attendance"
  | "library_access"
  | "hostel_entry"
  | "examination_verification"
  | "cafeteria_access"
  | "faculty_attendance"
  | "staff_attendance"
  | "visitor_management"
  | "campus_access_control";

export type PhysicalSecuritySubcategory =
  | "office_access"
  | "corporate_campus"
  | "factory_entry"
  | "warehouse_security"
  | "data_center_security"
  | "hospital_security"
  | "residential_society"
  | "smart_building"
  | "government_building"
  | "airport_security"
  | "parking_access"
  | "visitor_management"
  | "construction_site"
  | "restricted_zone_access"
  | "multi_site_enterprise";

// ── Status enums ───────────────────────────────────────────────────────────────
export type BiometricStatus = "enrolled" | "pending" | "failed" | "not_enrolled";
export type DeviceStatus = "online" | "offline" | "warning" | "maintenance";
export type MemberStatus = "active" | "suspended" | "inactive" | "pending";
export type AuthResult = "success" | "failed" | "spoof_detected" | "liveness_fail";
export type IncidentSeverity = "low" | "medium" | "high" | "critical";
export type ProjectStatus = "active" | "inactive" | "draft" | "archived";
export type OrgStatus = "active" | "suspended" | "trial" | "churned";

// ── Organization ───────────────────────────────────────────────────────────────
export interface Organization {
  id: string;
  slug: string;
  name: string;
  logo?: string;
  industry: string;
  plan: "free" | "starter" | "pro" | "enterprise";
  status: OrgStatus;
  member_count: number;
  project_count: number;
  device_count: number;
  auth_count_30d: number;
  created_at: string;
  billing_email: string;
  owner_name: string;
  region: string;
}

// ── Project ────────────────────────────────────────────────────────────────────
export interface Project {
  id: string;
  org_id: string;
  name: string;
  slug: string;
  template: ProjectTemplate;
  status: ProjectStatus;
  subcategories: (EducationSubcategory | PhysicalSecuritySubcategory)[];
  member_count: number;
  device_count: number;
  enrolled_count: number;
  auth_count_30d: number;
  created_at: string;
  updated_at: string;
  description?: string;
  location?: string;
}

// ── Member ─────────────────────────────────────────────────────────────────────
export interface Member {
  id: string;
  org_id: string;
  project_ids: string[];
  name: string;
  email: string;
  phone?: string;
  photo_url?: string;
  member_type: MemberType;
  status: MemberStatus;
  face_status: BiometricStatus;
  fingerprint_status: BiometricStatus;
  rfid_tag?: string;
  department?: string;
  designation?: string;
  // Education-specific
  student_id?: string;
  roll_number?: string;
  course?: string;
  semester?: number;
  section?: string;
  guardian_contact?: string;
  // Physical Security-specific
  employee_id?: string;
  access_zones?: string[];
  clearance_level?: number;
  // Common
  last_auth_at?: string;
  enrolled_at?: string;
  created_at: string;
  updated_at: string;
}

// ── Device ─────────────────────────────────────────────────────────────────────
export type DeviceType =
  | "face_camera"
  | "fingerprint_scanner"
  | "turnstile"
  | "gate_controller"
  | "edge_device"
  | "iot_sensor"
  | "attendance_terminal";

export interface Device {
  id: string;
  org_id: string;
  project_id?: string;
  name: string;
  type: DeviceType;
  model: string;
  serial_number: string;
  status: DeviceStatus;
  firmware_version: string;
  ip_address?: string;
  location: string;
  zone?: string;
  last_sync_at: string;
  last_heartbeat_at: string;
  auth_count_today: number;
  uptime_pct: number;
  created_at: string;
}

// ── Authentication Log ─────────────────────────────────────────────────────────
export type AuthMethod = "face" | "fingerprint" | "hybrid" | "face+fingerprint";

export interface AuthLogEntry {
  id: string;
  org_id: string;
  project_id: string;
  member_id?: string;
  member_name?: string;
  member_type?: MemberType;
  device_id?: string;
  device_name?: string;
  method: AuthMethod;
  result: AuthResult;
  confidence_score?: number;
  liveness_score?: number;
  fingerprint_score?: number;
  spoof_detected?: boolean;
  failure_reason?: string;
  zone?: string;
  location?: string;
  timestamp: string;
  duration_ms?: number;
}

// ── Enrollment ─────────────────────────────────────────────────────────────────
export interface EnrollmentRecord {
  id: string;
  member_id: string;
  member_name: string;
  org_id: string;
  face_enrolled: boolean;
  fingerprint_enrolled: boolean;
  face_templates_count?: number;
  enrollment_method: "manual" | "camera" | "bulk_csv" | "api" | "invitation";
  enrolled_by?: string;
  enrolled_at: string;
  quality_score?: number;
}

// ── Access Zone (Physical Security) ───────────────────────────────────────────
export type ZoneSecurityLevel = "public" | "restricted" | "secure" | "classified";

export interface AccessZone {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  security_level: ZoneSecurityLevel;
  allowed_member_types: MemberType[];
  devices: string[];
  allowed_hours_start: string;
  allowed_hours_end: string;
  allowed_days: number[];
  requires_dual_auth: boolean;
  current_occupancy: number;
  max_occupancy?: number;
  status: "active" | "locked" | "emergency";
}

// ── Incidents (Physical Security) ─────────────────────────────────────────────
export type IncidentType =
  | "unauthorized_attempt"
  | "spoof_attempt"
  | "door_forced"
  | "device_offline"
  | "blacklist_match"
  | "security_escalation"
  | "tailgating"
  | "multiple_failed";

export interface Incident {
  id: string;
  project_id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  title: string;
  description: string;
  device_id?: string;
  device_name?: string;
  zone?: string;
  member_id?: string;
  member_name?: string;
  status: "open" | "investigating" | "resolved" | "dismissed";
  assigned_to?: string;
  occurred_at: string;
  resolved_at?: string;
}

// ── Department (Education) ─────────────────────────────────────────────────────
export interface Department {
  id: string;
  project_id: string;
  name: string;
  code: string;
  head_faculty?: string;
  student_count: number;
  faculty_count: number;
  staff_count: number;
  created_at: string;
}

// ── Class (Education) ──────────────────────────────────────────────────────────
export interface EducationClass {
  id: string;
  project_id: string;
  department_id: string;
  name: string;
  code: string;
  semester: number;
  sections: string[];
  student_count: number;
  faculty_id?: string;
  created_at: string;
}

// ── Visitor ────────────────────────────────────────────────────────────────────
export interface Visitor {
  id: string;
  org_id: string;
  project_id: string;
  name: string;
  email?: string;
  phone?: string;
  host_member_id?: string;
  host_name?: string;
  purpose: string;
  face_enrolled: boolean;
  badge_number?: string;
  approved: boolean;
  valid_from: string;
  valid_until: string;
  zones_allowed: string[];
  created_at: string;
  checked_in_at?: string;
  checked_out_at?: string;
}

// ── KPI Stats ─────────────────────────────────────────────────────────────────
export interface KPIStat {
  label: string;
  value: number | string;
  unit?: string;
  trend?: number; // percentage change
  trend_direction?: "up" | "down" | "neutral";
  sub_label?: string;
  color?: "default" | "success" | "warning" | "error" | "accent";
  icon?: string;
}

// ── Chart Data ─────────────────────────────────────────────────────────────────
export interface ChartDataPoint {
  date: string;
  label?: string;
  value?: number;
  value2?: number;
  value3?: number;
  [key: string]: string | number | undefined;
}

// ── Activity Feed ──────────────────────────────────────────────────────────────
export type ActivityType =
  | "member_enrolled"
  | "face_updated"
  | "auth_success"
  | "auth_failed"
  | "device_offline"
  | "device_online"
  | "incident_raised"
  | "member_added"
  | "member_suspended"
  | "project_created"
  | "org_created"
  | "policy_changed";

export interface ActivityFeedItem {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  actor?: string;
  target?: string;
  timestamp: string;
  severity?: "info" | "success" | "warning" | "error";
}

// ── Notification ───────────────────────────────────────────────────────────────
export interface Notification {
  id: string;
  type: "alert" | "info" | "success" | "warning";
  title: string;
  message: string;
  read: boolean;
  link?: string;
  timestamp: string;
}

// ── Navigation ─────────────────────────────────────────────────────────────────
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  badge?: number | string;
  children?: NavItem[];
  roles?: UserRole[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// ── Platform Analytics (Super Admin) ──────────────────────────────────────────
export interface PlatformStats {
  total_orgs: number;
  total_members: number;
  total_devices: number;
  total_auth_today: number;
  total_auth_30d: number;
  auth_success_rate: number;
  enrolled_members: number;
  enrollment_rate: number;
  online_devices: number;
  device_health_rate: number;
  active_projects: number;
  open_incidents: number;
}

// ── AI Model ───────────────────────────────────────────────────────────────────
export type ModelType = "face_recognition" | "liveness" | "fingerprint" | "deepfake" | "emotion";
export type ModelStatus = "production" | "beta" | "deprecated" | "testing";

export interface AIModel {
  id: string;
  name: string;
  type: ModelType;
  version: string;
  status: ModelStatus;
  accuracy: number;
  latency_ms: number;
  deployed_at: string;
  model_size_mb: number;
  description: string;
}

// ── Infrastructure ─────────────────────────────────────────────────────────────
export interface ServiceHealth {
  name: string;
  status: "operational" | "degraded" | "outage" | "maintenance";
  uptime_pct: number;
  latency_ms: number;
  last_incident?: string;
  region: string;
}

// ── Billing ────────────────────────────────────────────────────────────────────
export interface BillingRecord {
  org_id: string;
  org_name: string;
  plan: string;
  mrr_usd: number;
  auth_count: number;
  member_count: number;
  overage_usd: number;
  total_usd: number;
  status: "paid" | "pending" | "overdue" | "trial";
  period: string;
}
