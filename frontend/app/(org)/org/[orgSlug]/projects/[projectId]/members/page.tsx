"use client";

import React from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ChartCard } from "@/components/dashboard/ChartCard";
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
import { mockStudents, mockFaculty } from "@/lib/mock-data/education";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Download,
  UserPlus,
  Edit,
  Trash2,
  Lock,
  RotateCcw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

type Tab = "students" | "faculty" | "staff" | "visitors";

import { apiClient } from "@/lib/api";
import { toast } from "sonner";

export default function MembersPage({ params }: { params: Promise<{ orgSlug: string; projectId: string }> }) {
  const { orgSlug, projectId } = React.use(params);
  const [activeTab, setActiveTab] = React.useState<Tab>("students");
  const [search, setSearch] = React.useState("");
  const [identities, setIdentities] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchIdentities = React.useCallback(async () => {
    try {
      const { data } = await apiClient.get(`/identities?application_id=${projectId}&page=1&page_size=100`);
      let list = data.items || [];

      // Auto-seeding helper if DB is completely empty for this project
      if (list.length === 0) {
        toast.info("Initializing project members database...");
        
        // Seed 4 students
        const studentsToSeed = mockStudents.slice(0, 4).map(s => ({
          type: "student",
          name: s.name,
          email: s.email,
          roll_number: s.roll_number,
          department: s.department,
          course: s.course,
          semester: s.semester,
          status: s.status,
          face_status: s.face_status,
          fingerprint_status: s.fingerprint_status,
          last_auth_at: s.last_auth_at,
          enrolled_at: s.enrolled_at,
        }));

        // Seed 2 faculty
        const facultyToSeed = mockFaculty.slice(0, 2).map(f => ({
          type: "faculty",
          name: f.name,
          email: f.email,
          employee_id: f.employee_id,
          department: f.department,
          designation: f.designation,
          status: f.status,
          face_status: f.face_status,
          fingerprint_status: f.fingerprint_status,
          last_auth_at: f.last_auth_at,
          enrolled_at: f.enrolled_at,
        }));

        const allSeeds = [...studentsToSeed, ...facultyToSeed];
        
        // Sequential creation
        for (const seed of allSeeds) {
          await apiClient.post("/identities", {
            application_id: projectId,
            external_user_id: JSON.stringify(seed),
          });
        }

        // Re-fetch
        const refetch = await apiClient.get(`/identities?application_id=${projectId}&page=1&page_size=100`);
        list = refetch.data.items || [];
      }

      // Map backend Identity models back to UI components
      const mapped = list.map((item: any) => {
        let details: any = {};
        try {
          details = JSON.parse(item.external_user_id);
        } catch {
          // fallback parser for unstructured strings
          details = {
            name: item.external_user_id,
            email: `${item.external_user_id.toLowerCase().replace(/\s+/g, "")}@iitd.ac.in`,
            type: item.external_user_id.toLowerCase().includes("prof") ? "faculty" : "student",
            department: "Computer Science",
          };
        }

        return {
          id: item.id,
          name: details.name || "Unknown Member",
          email: details.email || "",
          type: details.type || "student",
          roll_number: details.roll_number,
          employee_id: details.employee_id,
          department: details.department || "General",
          course: details.course || "B.Tech",
          semester: details.semester || 1,
          designation: details.designation || "Assistant Professor",
          face_status: item.enrollment_status === "enrolled" ? "enrolled" : item.enrollment_status,
          fingerprint_status: item.enrollment_status === "enrolled" ? "enrolled" : "not_enrolled",
          status: details.status || "active",
          last_auth_at: details.last_auth_at,
          enrolled_at: item.created_at,
        };
      });

      setIdentities(mapped);
    } catch (err) {
      console.error("Failed to load project members:", err);
      toast.error("Failed to fetch project members");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  React.useEffect(() => {
    fetchIdentities();
  }, [fetchIdentities]);

  const handleDeleteMember = async (memberId: string) => {
    try {
      await apiClient.delete(`/identities/${memberId}`);
      toast.success("Member removed successfully");
      fetchIdentities();
    } catch (err) {
      toast.error("Failed to delete member");
    }
  };

  const members = identities.filter((m) => m.type === (activeTab === "students" ? "student" : "faculty"));
  const filtered = members.filter((m) =>
    search
      ? m.name.toLowerCase().includes(search.toLowerCase()) ||
        (m.roll_number ?? m.employee_id ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (m.department ?? "").toLowerCase().includes(search.toLowerCase())
      : true
  );

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "students", label: "Students", count: identities.filter(i => i.type === "student").length },
    { id: "faculty", label: "Faculty", count: identities.filter(i => i.type === "faculty").length },
    { id: "staff", label: "Staff", count: 0 },
    { id: "visitors", label: "Visitors", count: 0 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Members"
        description="Manage all biometric members across student, faculty, staff, and visitor categories."
        breadcrumbs={[
          { label: "IIT Delhi Campus", href: `/org/${orgSlug}/projects/${projectId}` },
          { label: "Members" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs border-white/10 text-white/60 hover:text-white hover:bg-white/[0.05]">
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
            <Button size="sm" className="h-8 gap-1.5 text-xs">
              <UserPlus className="h-3.5 w-3.5" />
              Add Member
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-xl border border-white/[0.065] bg-white/[0.02] p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearch(""); }}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all",
              activeTab === tab.id
                ? "bg-white/[0.08] text-white shadow-sm"
                : "text-white/35 hover:text-white/60"
            )}
          >
            {tab.label}
            <span className={cn("rounded-full px-1.5 py-0.5 text-[9.5px] font-bold", activeTab === tab.id ? "bg-[#00E5A8]/15 text-[#00E5A8]" : "bg-white/[0.05] text-white/30")}>
              {tab.count.toLocaleString()}
            </span>
          </button>
        ))}
      </div>

      {/* Table card */}
      <ChartCard title="" index={0} className="p-0 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-2 border-b border-white/[0.055] p-4">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2 focus-within:border-[#00E5A8]/30">
            <Search className="h-3.5 w-3.5 text-white/25" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none"
            />
          </div>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs border-white/10 text-white/50 hover:text-white hover:bg-white/[0.05]">
            <Filter className="h-3.5 w-3.5" />
            Filter
          </Button>
        </div>

        {activeTab === "students" || activeTab === "faculty" ? (
          <div className="p-0">
            {filtered.length === 0 ? (
              <EmptyState
                variant={search ? "no-results" : "no-members"}
                description={search ? `No ${activeTab} found for "${search}"` : undefined}
                action={!search ? { label: "Add Member", onClick: () => {} } : undefined}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    {activeTab === "students" && <TableHead>Roll No.</TableHead>}
                    {activeTab === "faculty" && <TableHead>Employee ID</TableHead>}
                    <TableHead>Department</TableHead>
                    {activeTab === "students" && <TableHead>Course / Sem</TableHead>}
                    {activeTab === "faculty" && <TableHead>Designation</TableHead>}
                    <TableHead>Face</TableHead>
                    <TableHead>Fingerprint</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Auth</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((member, i) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#00E5A8]/20 to-[#0EA5E9]/15 text-[11px] font-bold text-[#00E5A8] shrink-0">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-[12.5px] font-semibold text-white/85">{member.name}</p>
                            <p className="text-[10.5px] text-white/30">{member.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-[11.5px] text-white/50">
                        {member.roll_number ?? member.employee_id}
                      </TableCell>
                      <TableCell className="text-white/55">{member.department}</TableCell>
                      <TableCell className="text-white/45 text-[11.5px]">
                        {activeTab === "students"
                          ? `${member.course} · Sem ${member.semester}`
                          : member.designation}
                      </TableCell>
                      <TableCell>
                        <StatusBadge variant="biometric" status={member.face_status} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge variant="biometric" status={member.fingerprint_status} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge variant="member" status={member.status} />
                      </TableCell>
                      <TableCell className="text-[11px] text-white/30">
                        {member.last_auth_at
                          ? formatDistanceToNow(new Date(member.last_auth_at), { addSuffix: true })
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="flex h-7 w-7 items-center justify-center rounded-md text-white/25 hover:bg-white/[0.06] hover:text-white/60 transition-colors">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 rounded-xl border border-white/[0.09] bg-[#0a0a0a] p-1">
                            <DropdownMenuItem className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-white/60 hover:bg-white/[0.05] hover:text-white cursor-pointer">
                              <Edit className="h-3.5 w-3.5" />
                              Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-white/60 hover:bg-white/[0.05] hover:text-white cursor-pointer">
                              <RotateCcw className="h-3.5 w-3.5" />
                              Reset Biometrics
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-white/60 hover:bg-white/[0.05] hover:text-white cursor-pointer">
                              <Lock className="h-3.5 w-3.5" />
                              Suspend
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/[0.06]" />
                            <DropdownMenuItem
                              onClick={() => handleDeleteMember(member.id)}
                              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-[#f87171]/60 hover:bg-[#f87171]/[0.06] hover:text-[#f87171] cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        ) : (
          <EmptyState
            variant="empty"
            title={activeTab === "staff" ? "No staff members" : "No active visitors"}
            description={activeTab === "staff" ? "Add staff members to begin managing attendance." : "Register a visitor to get started."}
            action={{ label: activeTab === "staff" ? "Add Staff" : "Register Visitor", onClick: () => {} }}
          />
        )}
      </ChartCard>
    </div>
  );
}
