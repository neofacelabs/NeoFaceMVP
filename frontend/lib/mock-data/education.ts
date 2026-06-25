import type {
  Member,
  Device,
  AuthLogEntry,
  EnrollmentRecord,
  Department,
  EducationClass,
  Visitor,
  ActivityFeedItem,
  ChartDataPoint,
  Incident,
  AccessZone,
  Project,
} from "@/types/platform";

// ── Education Project ──────────────────────────────────────────────────────────
export const mockEducationProject: Project = {
  id: "edu-001",
  org_id: "org-001",
  name: "IIT Delhi Campus",
  slug: "iitd-campus",
  template: "education",
  status: "active",
  subcategories: [
    "campus_attendance",
    "classroom_attendance",
    "laboratory_attendance",
    "library_access",
    "hostel_entry",
    "examination_verification",
    "cafeteria_access",
    "faculty_attendance",
    "visitor_management",
  ],
  member_count: 12450,
  device_count: 284,
  enrolled_count: 11803,
  auth_count_30d: 98234,
  created_at: "2024-01-15T00:00:00Z",
  updated_at: "2024-06-20T00:00:00Z",
  location: "New Delhi, India",
};

// ── Students ───────────────────────────────────────────────────────────────────
export const mockStudents: Member[] = [
  { id: "m001", org_id: "org-001", project_ids: ["edu-001"], name: "Arjun Mehta", email: "arjun.mehta@iitd.ac.in", member_type: "student", status: "active", face_status: "enrolled", fingerprint_status: "enrolled", student_id: "2021CSE001", roll_number: "CS21B001", department: "Computer Science", course: "B.Tech", semester: 6, section: "A", phone: "+91-9876543001", guardian_contact: "+91-9876543100", created_at: "2021-08-01T00:00:00Z", updated_at: "2024-06-01T00:00:00Z", last_auth_at: new Date(Date.now() - 2 * 3600000).toISOString(), enrolled_at: "2021-08-15T00:00:00Z" },
  { id: "m002", org_id: "org-001", project_ids: ["edu-001"], name: "Priya Sharma", email: "priya.sharma@iitd.ac.in", member_type: "student", status: "active", face_status: "enrolled", fingerprint_status: "pending", student_id: "2021CSE002", roll_number: "CS21B002", department: "Computer Science", course: "B.Tech", semester: 6, section: "A", created_at: "2021-08-01T00:00:00Z", updated_at: "2024-06-01T00:00:00Z", last_auth_at: new Date(Date.now() - 4 * 3600000).toISOString() },
  { id: "m003", org_id: "org-001", project_ids: ["edu-001"], name: "Rahul Verma", email: "rahul.verma@iitd.ac.in", member_type: "student", status: "active", face_status: "enrolled", fingerprint_status: "enrolled", student_id: "2022EE001", roll_number: "EE22B001", department: "Electrical Engineering", course: "B.Tech", semester: 4, section: "B", created_at: "2022-08-01T00:00:00Z", updated_at: "2024-06-01T00:00:00Z", last_auth_at: new Date(Date.now() - 1 * 3600000).toISOString() },
  { id: "m004", org_id: "org-001", project_ids: ["edu-001"], name: "Sneha Patel", email: "sneha.patel@iitd.ac.in", member_type: "student", status: "suspended", face_status: "enrolled", fingerprint_status: "enrolled", student_id: "2020ME001", roll_number: "ME20B001", department: "Mechanical Engineering", course: "B.Tech", semester: 8, section: "A", created_at: "2020-08-01T00:00:00Z", updated_at: "2024-05-15T00:00:00Z" },
  { id: "m005", org_id: "org-001", project_ids: ["edu-001"], name: "Karan Singh", email: "karan.singh@iitd.ac.in", member_type: "student", status: "active", face_status: "not_enrolled", fingerprint_status: "not_enrolled", student_id: "2023CE001", roll_number: "CE23B001", department: "Civil Engineering", course: "B.Tech", semester: 2, section: "C", created_at: "2023-08-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "m006", org_id: "org-001", project_ids: ["edu-001"], name: "Aisha Khan", email: "aisha.khan@iitd.ac.in", member_type: "student", status: "active", face_status: "enrolled", fingerprint_status: "enrolled", student_id: "2021PHY001", roll_number: "PH21B001", department: "Physics", course: "B.Sc.", semester: 6, section: "A", created_at: "2021-08-01T00:00:00Z", updated_at: "2024-06-01T00:00:00Z", last_auth_at: new Date(Date.now() - 30 * 60000).toISOString() },
];

// ── Faculty ────────────────────────────────────────────────────────────────────
export const mockFaculty: Member[] = [
  { id: "f001", org_id: "org-001", project_ids: ["edu-001"], name: "Dr. Rajesh Sharma", email: "rsharma@iitd.ac.in", member_type: "faculty", status: "active", face_status: "enrolled", fingerprint_status: "enrolled", employee_id: "FAC-001", department: "Computer Science", designation: "Professor", phone: "+91-9876501001", created_at: "2015-07-01T00:00:00Z", updated_at: "2024-06-01T00:00:00Z", last_auth_at: new Date(Date.now() - 45 * 60000).toISOString() },
  { id: "f002", org_id: "org-001", project_ids: ["edu-001"], name: "Prof. Ananya Bose", email: "abose@iitd.ac.in", member_type: "faculty", status: "active", face_status: "enrolled", fingerprint_status: "pending", employee_id: "FAC-002", department: "Electrical Engineering", designation: "Associate Professor", created_at: "2018-07-01T00:00:00Z", updated_at: "2024-06-01T00:00:00Z" },
  { id: "f003", org_id: "org-001", project_ids: ["edu-001"], name: "Dr. Suresh Iyer", email: "siyer@iitd.ac.in", member_type: "faculty", status: "active", face_status: "enrolled", fingerprint_status: "enrolled", employee_id: "FAC-003", department: "Mechanical Engineering", designation: "Assistant Professor", created_at: "2020-07-01T00:00:00Z", updated_at: "2024-06-01T00:00:00Z", last_auth_at: new Date(Date.now() - 3 * 3600000).toISOString() },
];

// ── Departments ────────────────────────────────────────────────────────────────
export const mockDepartments: Department[] = [
  { id: "dept-001", project_id: "edu-001", name: "Computer Science & Engineering", code: "CSE", head_faculty: "Dr. Rajesh Sharma", student_count: 2840, faculty_count: 42, staff_count: 8, created_at: "2024-01-15T00:00:00Z" },
  { id: "dept-002", project_id: "edu-001", name: "Electrical Engineering", code: "EE", head_faculty: "Prof. Ananya Bose", student_count: 1920, faculty_count: 38, staff_count: 6, created_at: "2024-01-15T00:00:00Z" },
  { id: "dept-003", project_id: "edu-001", name: "Mechanical Engineering", code: "ME", head_faculty: "Dr. Suresh Iyer", student_count: 1680, faculty_count: 35, staff_count: 7, created_at: "2024-01-15T00:00:00Z" },
  { id: "dept-004", project_id: "edu-001", name: "Civil Engineering", code: "CE", head_faculty: "Prof. R.K. Jain", student_count: 1240, faculty_count: 28, staff_count: 5, created_at: "2024-01-15T00:00:00Z" },
  { id: "dept-005", project_id: "edu-001", name: "Chemical Engineering", code: "CHE", head_faculty: "Dr. Meera Roy", student_count: 980, faculty_count: 22, staff_count: 4, created_at: "2024-01-15T00:00:00Z" },
  { id: "dept-006", project_id: "edu-001", name: "Physics", code: "PHY", head_faculty: "Dr. K.P. Singh", student_count: 640, faculty_count: 18, staff_count: 3, created_at: "2024-01-15T00:00:00Z" },
];

// ── Classes ────────────────────────────────────────────────────────────────────
export const mockClasses: EducationClass[] = [
  { id: "cls-001", project_id: "edu-001", department_id: "dept-001", name: "B.Tech CSE", code: "BTECHCSE", semester: 6, sections: ["A", "B", "C"], student_count: 480, faculty_id: "f001", created_at: "2024-01-15T00:00:00Z" },
  { id: "cls-002", project_id: "edu-001", department_id: "dept-001", name: "M.Tech CSE", code: "MTECHCSE", semester: 2, sections: ["A"], student_count: 120, faculty_id: "f002", created_at: "2024-01-15T00:00:00Z" },
  { id: "cls-003", project_id: "edu-001", department_id: "dept-002", name: "B.Tech EE", code: "BTECHEE", semester: 4, sections: ["A", "B"], student_count: 360, faculty_id: "f003", created_at: "2024-01-15T00:00:00Z" },
];

// ── Education Devices ──────────────────────────────────────────────────────────
export const mockEducationDevices: Device[] = [
  { id: "dev-001", org_id: "org-001", project_id: "edu-001", name: "Main Gate Camera A1", type: "face_camera", model: "NeoFace Edge Pro", serial_number: "NFE-2024-001", status: "online", firmware_version: "4.2.1", ip_address: "192.168.1.101", location: "Main Gate", zone: "campus_access_control", last_sync_at: new Date(Date.now() - 5 * 60000).toISOString(), last_heartbeat_at: new Date(Date.now() - 30000).toISOString(), auth_count_today: 1842, uptime_pct: 99.8, created_at: "2024-01-20T00:00:00Z" },
  { id: "dev-002", org_id: "org-001", project_id: "edu-001", name: "Library Fingerprint Scanner", type: "fingerprint_scanner", model: "BioScan Elite", serial_number: "BSE-2024-045", status: "online", firmware_version: "2.1.0", location: "Central Library", zone: "library_access", last_sync_at: new Date(Date.now() - 2 * 60000).toISOString(), last_heartbeat_at: new Date(Date.now() - 15000).toISOString(), auth_count_today: 623, uptime_pct: 99.9, created_at: "2024-01-20T00:00:00Z" },
  { id: "dev-003", org_id: "org-001", project_id: "edu-001", name: "Lab Block C Camera", type: "face_camera", model: "NeoFace Edge Lite", serial_number: "NFE-2024-012", status: "offline", firmware_version: "4.1.8", location: "Lab Block C, Floor 2", zone: "laboratory_attendance", last_sync_at: new Date(Date.now() - 2 * 3600000).toISOString(), last_heartbeat_at: new Date(Date.now() - 2 * 3600000).toISOString(), auth_count_today: 0, uptime_pct: 87.4, created_at: "2024-01-20T00:00:00Z" },
  { id: "dev-004", org_id: "org-001", project_id: "edu-001", name: "Hostel Block A Entry", type: "face_camera", model: "NeoFace Edge Pro", serial_number: "NFE-2024-028", status: "warning", firmware_version: "4.0.2", location: "Hostel Block A", zone: "hostel_entry", last_sync_at: new Date(Date.now() - 30 * 60000).toISOString(), last_heartbeat_at: new Date(Date.now() - 5 * 60000).toISOString(), auth_count_today: 284, uptime_pct: 94.2, created_at: "2024-01-20T00:00:00Z" },
];

// ── Auth Logs ──────────────────────────────────────────────────────────────────
export const mockAuthLogs: AuthLogEntry[] = [
  { id: "log-001", org_id: "org-001", project_id: "edu-001", member_id: "m001", member_name: "Arjun Mehta", member_type: "student", device_id: "dev-001", device_name: "Main Gate Camera A1", method: "face", result: "success", confidence_score: 98.4, liveness_score: 99.1, zone: "campus_access_control", timestamp: new Date(Date.now() - 5 * 60000).toISOString(), duration_ms: 342 },
  { id: "log-002", org_id: "org-001", project_id: "edu-001", member_id: "f001", member_name: "Dr. Rajesh Sharma", member_type: "faculty", device_id: "dev-001", device_name: "Main Gate Camera A1", method: "face", result: "success", confidence_score: 99.2, liveness_score: 99.8, zone: "campus_access_control", timestamp: new Date(Date.now() - 12 * 60000).toISOString(), duration_ms: 289 },
  { id: "log-003", org_id: "org-001", project_id: "edu-001", member_id: "m002", member_name: "Priya Sharma", member_type: "student", device_id: "dev-002", device_name: "Library Fingerprint Scanner", method: "fingerprint", result: "success", fingerprint_score: 97.8, zone: "library_access", timestamp: new Date(Date.now() - 18 * 60000).toISOString(), duration_ms: 180 },
  { id: "log-004", org_id: "org-001", project_id: "edu-001", device_id: "dev-001", device_name: "Main Gate Camera A1", method: "face", result: "failed", failure_reason: "Low confidence score", confidence_score: 61.2, liveness_score: 98.4, zone: "campus_access_control", timestamp: new Date(Date.now() - 25 * 60000).toISOString(), duration_ms: 512 },
  { id: "log-005", org_id: "org-001", project_id: "edu-001", device_id: "dev-004", device_name: "Hostel Block A Entry", method: "face", result: "spoof_detected", spoof_detected: true, confidence_score: 91.2, liveness_score: 12.4, zone: "hostel_entry", timestamp: new Date(Date.now() - 40 * 60000).toISOString(), duration_ms: 890 },
];

// ── Education Activity Feed ────────────────────────────────────────────────────
export const mockEducationActivity: ActivityFeedItem[] = [
  { id: "ea1", type: "member_enrolled", title: "Student enrolled", description: "Arjun Mehta (CS21B001) completed face + fingerprint enrollment.", timestamp: new Date(Date.now() - 8 * 60000).toISOString(), severity: "success" },
  { id: "ea2", type: "device_offline", title: "Device offline", description: "Lab Block C Camera went offline. Check network connection.", timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), severity: "error" },
  { id: "ea3", type: "auth_failed", title: "Spoof attempt detected", description: "Unauthorized access attempt at Hostel Block A — spoof detected.", timestamp: new Date(Date.now() - 40 * 60000).toISOString(), severity: "error" },
  { id: "ea4", type: "member_added", title: "New batch imported", description: "180 first-year students added via CSV import (CSE Dept).", timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), severity: "info" },
  { id: "ea5", type: "auth_success", title: "High traffic period", description: "Peak: 1,842 authentications at Main Gate between 8:30–9:30 AM.", timestamp: new Date(Date.now() - 5 * 3600000).toISOString(), severity: "info" },
];

// ── Attendance Trend Chart ─────────────────────────────────────────────────────
export const mockAttendanceTrend: ChartDataPoint[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const base = isWeekend ? 800 : 7200 + Math.random() * 2000;
  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    present: Math.round(base * (0.85 + Math.random() * 0.1)),
    absent: Math.round(base * (0.05 + Math.random() * 0.05)),
    late: Math.round(base * 0.05),
  };
});

export const mockPeakHours: ChartDataPoint[] = [
  { date: "6 AM", value: 120 },
  { date: "7 AM", value: 480 },
  { date: "8 AM", value: 1840 },
  { date: "9 AM", value: 2240 },
  { date: "10 AM", value: 980 },
  { date: "11 AM", value: 760 },
  { date: "12 PM", value: 1120 },
  { date: "1 PM", value: 1340 },
  { date: "2 PM", value: 840 },
  { date: "3 PM", value: 620 },
  { date: "4 PM", value: 480 },
  { date: "5 PM", value: 920 },
  { date: "6 PM", value: 680 },
  { date: "7 PM", value: 340 },
  { date: "8 PM", value: 180 },
];

// ── Physical Security Project ──────────────────────────────────────────────────
export const mockPhysicalSecurityProject: Project = {
  id: "sec-001",
  org_id: "org-002",
  name: "Acme HQ Security",
  slug: "acme-hq",
  template: "physical_security",
  status: "active",
  subcategories: ["office_access", "data_center_security", "restricted_zone_access", "visitor_management", "parking_access"],
  member_count: 8290,
  device_count: 412,
  enrolled_count: 7980,
  auth_count_30d: 124567,
  created_at: "2023-11-08T00:00:00Z",
  updated_at: "2024-06-20T00:00:00Z",
  location: "New York, USA",
};

// ── Access Zones ───────────────────────────────────────────────────────────────
export const mockAccessZones: AccessZone[] = [
  { id: "zone-001", project_id: "sec-001", name: "Main Lobby", description: "Public reception and lobby area", security_level: "public", allowed_member_types: ["employee", "contractor", "visitor", "vip"], devices: ["dev-a01", "dev-a02"], allowed_hours_start: "06:00", allowed_hours_end: "22:00", allowed_days: [1,2,3,4,5], requires_dual_auth: false, current_occupancy: 48, max_occupancy: 200, status: "active" },
  { id: "zone-002", project_id: "sec-001", name: "Executive Floor (12F)", description: "C-suite offices and boardrooms", security_level: "restricted", allowed_member_types: ["employee", "vip"], devices: ["dev-b01", "dev-b02"], allowed_hours_start: "07:00", allowed_hours_end: "21:00", allowed_days: [1,2,3,4,5], requires_dual_auth: false, current_occupancy: 12, max_occupancy: 50, status: "active" },
  { id: "zone-003", project_id: "sec-001", name: "Data Center", description: "Primary data center — Tier III", security_level: "classified", allowed_member_types: ["employee"], devices: ["dev-c01"], allowed_hours_start: "00:00", allowed_hours_end: "23:59", allowed_days: [0,1,2,3,4,5,6], requires_dual_auth: true, current_occupancy: 3, max_occupancy: 15, status: "active" },
  { id: "zone-004", project_id: "sec-001", name: "Server Room B", description: "Backup server infrastructure", security_level: "secure", allowed_member_types: ["employee"], devices: ["dev-d01"], allowed_hours_start: "08:00", allowed_hours_end: "20:00", allowed_days: [1,2,3,4,5], requires_dual_auth: true, current_occupancy: 1, max_occupancy: 8, status: "active" },
  { id: "zone-005", project_id: "sec-001", name: "Parking Garage", description: "Underground parking levels B1–B3", security_level: "public", allowed_member_types: ["employee", "contractor", "visitor"], devices: ["dev-e01", "dev-e02"], allowed_hours_start: "05:30", allowed_hours_end: "23:00", allowed_days: [0,1,2,3,4,5,6], requires_dual_auth: false, current_occupancy: 284, max_occupancy: 400, status: "active" },
];

// ── Incidents ──────────────────────────────────────────────────────────────────
export const mockIncidents: Incident[] = [
  { id: "inc-001", project_id: "sec-001", type: "spoof_attempt", severity: "high", title: "Spoof attempt at Server Room B", description: "Photo attack detected at Server Room B entrance. Liveness score: 8.4%. Blocked automatically.", device_id: "dev-d01", device_name: "Server Room B Scanner", zone: "Server Room B", status: "investigating", occurred_at: new Date(Date.now() - 40 * 60000).toISOString() },
  { id: "inc-002", project_id: "sec-001", type: "multiple_failed", severity: "medium", title: "Multiple failed attempts — Executive Floor", description: "6 failed authentication attempts in 5 minutes at Executive Floor elevator.", zone: "Executive Floor (12F)", status: "open", occurred_at: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: "inc-003", project_id: "sec-001", type: "device_offline", severity: "low", title: "Camera offline — Parking B2", description: "Parking Level B2 camera lost connection. Maintenance scheduled.", device_id: "dev-e02", device_name: "Parking B2 Camera", zone: "Parking Garage", status: "open", occurred_at: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: "inc-004", project_id: "sec-001", type: "blacklist_match", severity: "critical", title: "Blacklisted individual detected", description: "Former employee (terminated) attempted access at Main Lobby. Security notified.", zone: "Main Lobby", status: "resolved", occurred_at: new Date(Date.now() - 12 * 3600000).toISOString(), resolved_at: new Date(Date.now() - 11 * 3600000).toISOString() },
];
