"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { KPICard, KPIGrid } from "@/components/dashboard/KPICard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Fingerprint,
  Camera,
  Upload,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  ScanFace,
  X,
  Plus,
  Loader2,
  Check,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { apiClient, enrollmentApi } from "@/lib/api";
import { toast } from "sonner";

export default function EnrollmentPage({
  params,
}: {
  params: Promise<{ orgSlug: string; projectId: string }>;
}) {
  const { orgSlug, projectId } = React.use(params);
  const [search, setSearch] = useState("");
  const [identities, setIdentities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null); // if enrolling existing
  const [submitting, setSubmitting] = useState(false);

  // Form states for new enrollment
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [type, setType] = useState("student");
  const [uploadFiles, setUploadFiles] = useState<{ file: File; url: string; score?: number; error?: string }[]>([]);

  const fetchEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get(`/identities?application_id=${projectId}&page=1&page_size=100`);
      const list = data.items || [];
      const mapped = list.map((item: any) => {
        let details: any = {};
        try {
          details = JSON.parse(item.external_user_id);
        } catch {
          details = {
            name: item.external_user_id,
            email: `${item.external_user_id.toLowerCase().replace(/\s+/g, "")}@neoface.io`,
            type: "student",
            department: "General",
          };
        }

        return {
          id: item.id,
          name: details.name || "Unknown Member",
          email: details.email || "",
          type: details.type || "student",
          roll_number: details.roll_number || details.employee_id || "N/A",
          department: details.department || "General",
          face_status: item.enrollment_status,
          fingerprint_status: item.enrollment_status === "enrolled" ? "enrolled" : "not_enrolled",
          enrolled_at: item.created_at,
          raw_external_id: item.external_user_id,
        };
      });
      setIdentities(mapped);
    } catch (err) {
      console.error("Failed to load enrollments:", err);
      toast.error("Failed to load enrollment status");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const handleOpenNewEnroll = () => {
    setSelectedMember(null);
    setName("");
    setEmail("");
    setPhone("");
    setDepartment("");
    setType("student");
    setUploadFiles([]);
    setShowModal(true);
  };

  const handleOpenExistingEnroll = (member: any) => {
    setSelectedMember(member);
    setName(member.name);
    setEmail(member.email);
    setPhone("");
    setDepartment(member.department);
    setType(member.type);
    setUploadFiles([]);
    setShowModal(true);
  };

  // Frame validation for uploaded images
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (uploadFiles.length + files.length > 5) {
      toast.warning("You can upload up to 5 images.");
      return;
    }

    for (const file of files) {
      try {
        const url = URL.createObjectURL(file);
        const fd = new FormData();
        fd.append("file", file);

        const { data } = await enrollmentApi.validateFrame(fd);
        if (data.success) {
          setUploadFiles((prev) => [...prev, { file, url, score: data.quality_score }]);
        } else {
          setUploadFiles((prev) => [...prev, { file, url, error: data.error || "Quality check failed" }]);
          toast.error(`${file.name}: ${data.error || "Quality check failed"}`);
        }
      } catch (err) {
        console.error(file.name, err);
      }
    }
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validFiles = uploadFiles.filter(x => !x.error);
    if (validFiles.length < 1) {
      toast.error("At least 1 valid face photo with passing quality check is required.");
      return;
    }

    try {
      setSubmitting(true);

      // 1. If new enrollment, create AaaS Identity record first
      if (!selectedMember) {
        const externalIdObj = {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || undefined,
          department: department.trim() || "General",
          type: type,
        };
        await apiClient.post("/identities", {
          external_user_id: JSON.stringify(externalIdObj),
          application_id: projectId,
        });
      }

      // 2. Submit face photos to general enrollment endpoint
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("email", email.trim().toLowerCase());
      if (phone.trim()) fd.append("phone", phone.trim());
      validFiles.forEach((f) => {
        fd.append("images", f.file);
      });

      await enrollmentApi.enroll(fd);

      toast.success("Biometrics enrolled successfully! 🎉");
      setShowModal(false);
      await fetchEnrollments();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || "Enrollment failed.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered identities based on search query
  const filtered = identities.filter((s) =>
    search
      ? s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.department.toLowerCase().includes(search.toLowerCase())
      : true
  );

  // Dynamic metrics
  const enrolledCount = identities.filter((s) => s.face_status === "enrolled").length;
  const pendingCount = identities.filter((s) => s.face_status === "pending").length;
  const failedCount = identities.filter((s) => s.face_status === "failed").length;
  const notStartedCount = identities.filter((s) => s.face_status === "not_enrolled" || !s.face_status).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enrollment Portal"
        description="Manage biometric enrollment profiles and capture face templates for application members."
        breadcrumbs={[
          { label: "Dashboard", href: `/org/${orgSlug}` },
          { label: "Project", href: `/org/${orgSlug}/projects/${projectId}` },
          { label: "Enrollment" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleOpenNewEnroll}
              className="h-8 gap-1.5 text-xs font-semibold"
            >
              <ScanFace className="h-3.5 w-3.5" />
              Start Enrollment
            </Button>
          </div>
        }
      />

      <KPIGrid columns={4}>
        <KPICard label="Enrolled Members" value={enrolledCount} color="success" index={0} />
        <KPICard label="Pending Approval" value={pendingCount} color="warning" index={1} />
        <KPICard label="Quality Failure" value={failedCount} color="error" index={2} />
        <KPICard label="Not Enrolled" value={notStartedCount} index={3} />
      </KPIGrid>

      {/* Progress Bars */}
      <ChartCard title="Enrollment Progress" description="Biometric coverage by role type" index={0}>
        <div className="space-y-4">
          {["student", "faculty", "staff", "visitor"].map((cat, i) => {
            const list = identities.filter((x) => x.type === cat);
            const total = list.length;
            const enrolled = list.filter((x) => x.face_status === "enrolled").length;
            const pct = total > 0 ? ((enrolled / total) * 100).toFixed(1) : "0.0";
            const colors = ["#00E5A8", "#38BDF8", "#14B8A6", "#fbbf24"];
            return (
              <div key={cat} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm capitalize">
                  <span className="text-white/60">{cat}s</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-white/30">
                      {enrolled} / {total}
                    </span>
                    <span className="text-[12px] font-semibold" style={{ color: colors[i] }}>
                      {pct}%
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-white/[0.06]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.9, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full"
                    style={{ background: colors[i] }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </ChartCard>

      {/* Enrollment queue table */}
      <ChartCard title="Enrollment Status Queue" description="Individual member biometric status" index={1} className="p-0 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/[0.055] p-4">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2 focus-within:border-[#00E5A8]/30">
            <Search className="h-3.5 w-3.5 text-white/25" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, department..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEnrollments}
            className="h-8 gap-1.5 text-xs border-white/10 text-white/50 hover:text-white hover:bg-white/[0.05]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Face Status</TableHead>
              <TableHead>Overall Biometrics</TableHead>
              <TableHead>Enrolled At</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#00E5A8]" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-white/30">
                  No members found in this application scope.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((member, i) => {
                const enrolled = member.face_status === "enrolled";
                const isPending = member.face_status === "pending";
                const isFailed = member.face_status === "failed";

                return (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02]"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#00E5A8]/20 to-[#0EA5E9]/15 text-[11px] font-bold text-[#00E5A8] shrink-0">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[12.5px] font-medium text-white/80">{member.name}</p>
                          <p className="text-[10px] text-white/30">{member.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-[12px] text-white/50">{member.department}</TableCell>
                    <TableCell className="text-[12px] capitalize text-white/40">{member.type}</TableCell>
                    <TableCell>
                      <StatusBadge variant="biometric" status={member.face_status || "pending"} />
                    </TableCell>
                    <TableCell>
                      {enrolled ? (
                        <span className="flex items-center gap-1.5 text-[11.5px] font-medium text-[#00E5A8]">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                        </span>
                      ) : isFailed ? (
                        <span className="flex items-center gap-1.5 text-[11.5px] font-medium text-[#f87171]">
                          <XCircle className="h-3.5 w-3.5" /> Quality Reject
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-[11.5px] font-medium text-[#fbbf24]">
                          <Clock className="h-3.5 w-3.5" /> Pending Photo
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-[11px] text-white/30">
                      {member.enrolled_at
                        ? formatDistanceToNow(new Date(member.enrolled_at), { addSuffix: true })
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {!enrolled && (
                        <Button
                          size="sm"
                          onClick={() => handleOpenExistingEnroll(member)}
                          className="h-7 px-2.5 text-[11px] bg-white/[0.06] border border-white/[0.08] hover:bg-[#00E5A8] hover:text-black hover:border-[#00E5A8] transition-colors"
                        >
                          Enroll
                        </Button>
                      )}
                    </TableCell>
                  </motion.tr>
                );
              })
            )}
          </TableBody>
        </Table>
      </ChartCard>

      {/* Manual Biometric Enrollment Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#0d0d0d] p-6 shadow-modal"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ScanFace className="h-5 w-5 text-[#00E5A8]" />
                    {selectedMember ? `Enroll Face: ${selectedMember.name}` : "Start New Face Enrollment"}
                  </h3>
                  <p className="text-[11.5px] text-white/40 mt-1">
                    Upload 1 to 5 face images for ArcFace quality check & embedding registration.
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-full bg-white/[0.04] p-1 text-white/40 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleEnrollSubmit} className="space-y-4 mt-5">
                {!selectedMember && (
                  <>
                    {/* Name */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-white/30">Full Name</label>
                      <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-1.5">
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Alice Cooper"
                          className="w-full bg-transparent text-[12.5px] text-white outline-none"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-white/30">Email Address</label>
                      <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-1.5">
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. alice@university.edu"
                          className="w-full bg-transparent text-[12.5px] text-white outline-none"
                        />
                      </div>
                    </div>

                    {/* Phone & Department */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-white/30">Phone</label>
                        <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-1.5">
                          <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+919876543210"
                            className="w-full bg-transparent text-[12.5px] text-white outline-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-white/30">Department</label>
                        <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-1.5">
                          <input
                            type="text"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            placeholder="Computer Science"
                            className="w-full bg-transparent text-[12.5px] text-white outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Type selection */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-white/30">Identity Type</label>
                      <div className="rounded-lg border border-white/[0.07] bg-[#0d0d0d] px-3 py-1.5">
                        <select
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                          className="w-full bg-transparent text-[12.5px] text-white outline-none [&>option]:bg-[#0d0d0d]"
                        >
                          <option value="student">Student</option>
                          <option value="faculty">Faculty</option>
                          <option value="staff">Staff</option>
                          <option value="visitor">Visitor</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* Face image upload */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-white/30">Face Photograph Upload (1–5 photos)</label>
                  <label className="flex h-[110px] w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-white/[0.015] p-3 text-center hover:bg-white/[0.03] transition-all">
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Upload className="h-6 w-6 text-white/20 mb-1" />
                    <span className="text-[11.5px] font-semibold text-white/70">Click or Drag images</span>
                    <span className="text-[9.5px] text-white/35">JPEG, PNG, or WebP.</span>
                  </label>

                  {/* Thumbnail queue */}
                  {uploadFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 rounded-lg border border-white/[0.05] bg-white/[0.01] p-2">
                      {uploadFiles.map((item, idx) => (
                        <div key={idx} className="relative h-11 w-14 overflow-hidden rounded border border-white/[0.08]">
                          <img src={item.url} className="h-full w-full object-cover" />
                          {item.error ? (
                            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center" title={item.error}>
                              <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                            </div>
                          ) : (
                            <div className="absolute bottom-0 left-0 right-0 bg-[#00E5A8]/80 text-[7.5px] font-bold text-black text-center py-0.5">
                              {item.score ? `${Math.round(item.score)}%` : "OK"}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => setUploadFiles(prev => prev.filter((_, i) => i !== idx))}
                            className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5 text-white/70 hover:bg-black hover:text-white"
                          >
                            <X className="h-2 w-2" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer buttons */}
                <div className="flex items-center justify-between border-t border-white/[0.06] pt-4 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowModal(false)}
                    className="h-8 border-white/10 text-white/60 hover:text-white hover:bg-white/[0.05]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || uploadFiles.filter(x => !x.error).length < 1}
                    size="sm"
                    className="h-8 min-w-[120px] gap-1.5 font-semibold text-xs"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Enrolling...
                      </>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5" /> Submit Enrollment
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
