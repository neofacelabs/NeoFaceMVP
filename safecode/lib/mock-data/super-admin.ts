import type {
  Organization,
  Project,
  Member,
  Device,
  AuthLogEntry,
  ActivityFeedItem,
  KPIStat,
  ChartDataPoint,
  AIModel,
  ServiceHealth,
  BillingRecord,
  PlatformStats,
} from "@/types/platform";

// ── Platform Stats ─────────────────────────────────────────────────────────────
export const mockPlatformStats: PlatformStats = {
  total_orgs: 247,
  total_members: 89_412,
  total_devices: 1_834,
  total_auth_today: 23_456,
  total_auth_30d: 632_891,
  auth_success_rate: 97.4,
  enrolled_members: 81_203,
  enrollment_rate: 90.8,
  online_devices: 1_791,
  device_health_rate: 97.6,
  active_projects: 389,
  open_incidents: 14,
};

// ── Organizations ──────────────────────────────────────────────────────────────
export const mockOrganizations: Organization[] = [
  {
    id: "org-001",
    slug: "iit-delhi",
    name: "IIT Delhi",
    industry: "Higher Education",
    plan: "enterprise",
    status: "active",
    member_count: 12_450,
    project_count: 3,
    device_count: 284,
    auth_count_30d: 98_234,
    created_at: "2024-01-15T00:00:00Z",
    billing_email: "accounts@iitd.ac.in",
    owner_name: "Dr. Rajesh Sharma",
    region: "ap-south-1",
  },
  {
    id: "org-002",
    slug: "acme-corp",
    name: "Acme Corporation",
    industry: "Technology",
    plan: "enterprise",
    status: "active",
    member_count: 8_290,
    project_count: 5,
    device_count: 412,
    auth_count_30d: 124_567,
    created_at: "2023-11-08T00:00:00Z",
    billing_email: "security@acme.com",
    owner_name: "Sarah Chen",
    region: "us-east-1",
  },
  {
    id: "org-003",
    slug: "greenfield-society",
    name: "Greenfield Residential Society",
    industry: "Real Estate",
    plan: "pro",
    status: "active",
    member_count: 2_340,
    project_count: 1,
    device_count: 48,
    auth_count_30d: 18_900,
    created_at: "2024-03-01T00:00:00Z",
    billing_email: "admin@greenfield.in",
    owner_name: "Meera Gupta",
    region: "ap-south-1",
  },
  {
    id: "org-004",
    slug: "citymedical",
    name: "City Medical Hospital",
    industry: "Healthcare",
    plan: "pro",
    status: "active",
    member_count: 3_120,
    project_count: 2,
    device_count: 96,
    auth_count_30d: 41_200,
    created_at: "2024-02-14T00:00:00Z",
    billing_email: "it@citymedical.com",
    owner_name: "Dr. Anand Patel",
    region: "ap-south-1",
  },
  {
    id: "org-005",
    slug: "techno-global",
    name: "Techno Global Factory",
    industry: "Manufacturing",
    plan: "starter",
    status: "trial",
    member_count: 680,
    project_count: 1,
    device_count: 22,
    auth_count_30d: 5_400,
    created_at: "2024-06-01T00:00:00Z",
    billing_email: "ops@technoglobal.com",
    owner_name: "Vikram Singh",
    region: "ap-south-1",
  },
];

// ── AI Models ──────────────────────────────────────────────────────────────────
export const mockAIModels: AIModel[] = [
  {
    id: "model-001",
    name: "FaceNet v3.2",
    type: "face_recognition",
    version: "3.2.1",
    status: "production",
    accuracy: 99.4,
    latency_ms: 82,
    deployed_at: "2024-05-12T00:00:00Z",
    model_size_mb: 182,
    description: "Primary face recognition model. MobileFaceNet architecture, trained on 10M+ faces.",
  },
  {
    id: "model-002",
    name: "LiveGuard v2.1",
    type: "liveness",
    version: "2.1.0",
    status: "production",
    accuracy: 98.8,
    latency_ms: 45,
    deployed_at: "2024-04-30T00:00:00Z",
    model_size_mb: 64,
    description: "Passive liveness detection. Detects photos, replays, masks, and virtual cameras.",
  },
  {
    id: "model-003",
    name: "FingerprintNet v1.4",
    type: "fingerprint",
    version: "1.4.2",
    status: "production",
    accuracy: 99.1,
    latency_ms: 38,
    deployed_at: "2024-03-20T00:00:00Z",
    model_size_mb: 48,
    description: "Minutiae-based fingerprint matching with ISO 19794-2 compliance.",
  },
  {
    id: "model-004",
    name: "DeepShield v1.0",
    type: "deepfake",
    version: "1.0.3",
    status: "beta",
    accuracy: 96.2,
    latency_ms: 210,
    deployed_at: "2024-06-01T00:00:00Z",
    model_size_mb: 340,
    description: "Deepfake and GAN face detection. Dual-model ensemble (EfficientNet + XceptionNet).",
  },
  {
    id: "model-005",
    name: "EmotionSense v0.9",
    type: "emotion",
    version: "0.9.1",
    status: "testing",
    accuracy: 91.0,
    latency_ms: 55,
    deployed_at: "2024-05-28T00:00:00Z",
    model_size_mb: 72,
    description: "Real-time emotion recognition for 7 emotion categories.",
  },
];

// ── Service Health ─────────────────────────────────────────────────────────────
export const mockServiceHealth: ServiceHealth[] = [
  { name: "Auth API", status: "operational", uptime_pct: 99.97, latency_ms: 42, region: "ap-south-1" },
  { name: "Enrollment API", status: "operational", uptime_pct: 99.94, latency_ms: 118, region: "ap-south-1" },
  { name: "Face AI Engine", status: "operational", uptime_pct: 99.91, latency_ms: 82, region: "ap-south-1" },
  { name: "Liveness Engine", status: "operational", uptime_pct: 99.88, latency_ms: 45, region: "ap-south-1" },
  { name: "Fingerprint Engine", status: "operational", uptime_pct: 99.96, latency_ms: 38, region: "ap-south-1" },
  { name: "Device Gateway", status: "degraded", uptime_pct: 98.20, latency_ms: 320, region: "us-east-1", last_incident: "2024-06-25T14:00:00Z" },
  { name: "Notification Service", status: "operational", uptime_pct: 99.99, latency_ms: 12, region: "ap-south-1" },
  { name: "Audit Log Pipeline", status: "operational", uptime_pct: 100, latency_ms: 8, region: "global" },
];

// ── Billing ────────────────────────────────────────────────────────────────────
export const mockBilling: BillingRecord[] = [
  { org_id: "org-001", org_name: "IIT Delhi", plan: "Enterprise", mrr_usd: 4800, auth_count: 98234, member_count: 12450, overage_usd: 0, total_usd: 4800, status: "paid", period: "Jun 2024" },
  { org_id: "org-002", org_name: "Acme Corporation", plan: "Enterprise", mrr_usd: 6200, auth_count: 124567, member_count: 8290, overage_usd: 340, total_usd: 6540, status: "paid", period: "Jun 2024" },
  { org_id: "org-003", org_name: "Greenfield Society", plan: "Pro", mrr_usd: 1200, auth_count: 18900, member_count: 2340, overage_usd: 0, total_usd: 1200, status: "pending", period: "Jun 2024" },
  { org_id: "org-004", org_name: "City Medical", plan: "Pro", mrr_usd: 1800, auth_count: 41200, member_count: 3120, overage_usd: 120, total_usd: 1920, status: "overdue", period: "Jun 2024" },
  { org_id: "org-005", org_name: "Techno Global", plan: "Starter", mrr_usd: 0, auth_count: 5400, member_count: 680, overage_usd: 0, total_usd: 0, status: "trial", period: "Jun 2024" },
];

// ── Platform Activity ──────────────────────────────────────────────────────────
export const mockPlatformActivity: ActivityFeedItem[] = [
  { id: "a1", type: "org_created", title: "New organization joined", description: "Techno Global Factory signed up on Starter plan.", timestamp: new Date(Date.now() - 15 * 60000).toISOString(), severity: "info" },
  { id: "a2", type: "device_offline", title: "Device went offline", description: "Device Gateway cluster in us-east-1 showing degraded performance.", timestamp: new Date(Date.now() - 45 * 60000).toISOString(), severity: "warning" },
  { id: "a3", type: "member_enrolled", title: "Bulk enrollment completed", description: "IIT Delhi enrolled 847 students via CSV import.", timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), severity: "success" },
  { id: "a4", type: "policy_changed", title: "AI model deployed", description: "FaceNet v3.2 promoted to production across all regions.", timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), severity: "info" },
  { id: "a5", type: "incident_raised", title: "Security incident", description: "Acme Corp — 3 spoof attempts detected at Server Room entrance.", timestamp: new Date(Date.now() - 6 * 3600000).toISOString(), severity: "error" },
];

// ── Global Auth Trend Chart ────────────────────────────────────────────────────
export const mockGlobalAuthTrend: ChartDataPoint[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  const base = 18000 + Math.random() * 8000;
  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    total: Math.round(base),
    successful: Math.round(base * (0.94 + Math.random() * 0.05)),
    failed: Math.round(base * (0.01 + Math.random() * 0.04)),
  };
});
