"use client";

import React from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { KPICard, KPIGrid } from "@/components/dashboard/KPICard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { EmptyState } from "@/components/dashboard/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { mockStudents } from "@/lib/mock-data/education";
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
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default function EnrollmentPage({ params }: { params: Promise<{ orgSlug: string; projectId: string }> }) {
  const { orgSlug, projectId } = React.use(params);
  const [search, setSearch] = React.useState("");

  const enrolled = mockStudents.filter((s) => s.face_status === "enrolled" && s.fingerprint_status === "enrolled").length;
  const pending = mockStudents.filter((s) => s.face_status === "pending" || s.fingerprint_status === "pending").length;
  const failed = mockStudents.filter((s) => s.face_status === "failed" || s.fingerprint_status === "failed").length;
  const notEnrolled = mockStudents.filter((s) => s.face_status === "not_enrolled").length;

  const filtered = mockStudents.filter((s) =>
    search ? s.name.toLowerCase().includes(search.toLowerCase()) || (s.roll_number ?? "").toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enrollment"
        description="Manage biometric enrollment for all campus members."
        breadcrumbs={[
          { label: "IIT Delhi Campus", href: `/org/${orgSlug}/projects/${projectId}` },
          { label: "Enrollment" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs border-white/10 text-white/60 hover:text-white hover:bg-white/[0.05]">
              <Upload className="h-3.5 w-3.5" />
              Bulk Import
            </Button>
            <Button size="sm" className="h-8 gap-1.5 text-xs">
              <ScanFace className="h-3.5 w-3.5" />
              Start Enrollment
            </Button>
          </div>
        }
      />

      <KPIGrid columns={4}>
        <KPICard label="Fully Enrolled" value={enrolled} color="success" index={0} trend={2} trend_direction="up" />
        <KPICard label="Face Enrolled" value={10840 - notEnrolled} index={1} color="accent" />
        <KPICard label="Pending" value={pending} color="warning" index={2} />
        <KPICard label="Failed" value={failed} color="error" index={3} />
      </KPIGrid>

      {/* Progress bars */}
      <ChartCard title="Enrollment Progress" description="Biometric coverage across all member categories" index={0}>
        <div className="space-y-4">
          {[
            { label: "Students", total: 10840, enrolled: 10203, color: "#00E5A8" },
            { label: "Faculty", total: 342, enrolled: 335, color: "#38BDF8" },
            { label: "Staff", total: 280, enrolled: 248, color: "#14B8A6" },
            { label: "Visitors (Active)", total: 12, enrolled: 0, color: "#fbbf24" },
          ].map((cat, i) => {
            const pct = cat.total > 0 ? ((cat.enrolled / cat.total) * 100).toFixed(1) : "0.0";
            return (
              <div key={cat.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">{cat.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-white/30">{cat.enrolled.toLocaleString()} / {cat.total.toLocaleString()}</span>
                    <span className="text-[12px] font-semibold" style={{ color: cat.color }}>{pct}%</span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-white/[0.06]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.9, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full"
                    style={{ background: cat.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </ChartCard>

      {/* Enrollment queue table */}
      <ChartCard title="Enrollment Status" description="Individual member biometric status" index={1} className="p-0 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/[0.055] p-4">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2 focus-within:border-[#00E5A8]/30">
            <Search className="h-3.5 w-3.5 text-white/25" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none"
            />
          </div>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs border-white/10 text-white/50 hover:text-white hover:bg-white/[0.05]">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Roll / ID</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Face</TableHead>
              <TableHead>Fingerprint</TableHead>
              <TableHead>Overall Status</TableHead>
              <TableHead>Enrolled</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((member, i) => {
              const fullyEnrolled = member.face_status === "enrolled" && member.fingerprint_status === "enrolled";
              const hasFailure = member.face_status === "failed" || member.fingerprint_status === "failed";
              const hasPending = member.face_status === "pending" || member.fingerprint_status === "pending";

              return (
                <motion.tr
                  key={member.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02]"
                >
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#00E5A8]/20 to-[#0EA5E9]/15 text-[11px] font-bold text-[#00E5A8] shrink-0">
                        {member.name.charAt(0)}
                      </div>
                      <p className="text-[12px] font-medium text-white/80">{member.name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-white/40">{member.roll_number ?? member.employee_id}</TableCell>
                  <TableCell className="text-[11.5px] text-white/50">{member.department}</TableCell>
                  <TableCell><StatusBadge variant="biometric" status={member.face_status} /></TableCell>
                  <TableCell><StatusBadge variant="biometric" status={member.fingerprint_status} /></TableCell>
                  <TableCell>
                    {fullyEnrolled ? (
                      <span className="flex items-center gap-1.5 text-[11.5px] font-medium text-[#00E5A8]">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                      </span>
                    ) : hasFailure ? (
                      <span className="flex items-center gap-1.5 text-[11.5px] font-medium text-[#f87171]">
                        <XCircle className="h-3.5 w-3.5" /> Failed
                      </span>
                    ) : hasPending ? (
                      <span className="flex items-center gap-1.5 text-[11.5px] font-medium text-[#fbbf24]">
                        <Clock className="h-3.5 w-3.5" /> Pending
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[11.5px] font-medium text-white/30">
                        <AlertTriangle className="h-3.5 w-3.5" /> Not Started
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-[11px] text-white/30">
                    {member.enrolled_at
                      ? formatDistanceToNow(new Date(member.enrolled_at), { addSuffix: true })
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {!fullyEnrolled && (
                      <Button size="sm" variant="outline" className="h-7 px-2.5 text-[11px] border-white/10 text-white/50 hover:text-white hover:bg-white/[0.05]">
                        Enroll
                      </Button>
                    )}
                  </TableCell>
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </ChartCard>
    </div>
  );
}
