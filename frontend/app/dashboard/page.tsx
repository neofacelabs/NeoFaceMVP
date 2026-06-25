"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { usePlatformStore } from "@/store/platform";
import { authApi, apiClient } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const { setCurrentOrg, setCurrentProject, setRole: setPlatformRole } = usePlatformStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function resolveRedirect() {
      try {
        // Fetch current user from backend
        const { data: user } = await authApi.me();
        setUser(user);

        if (user.role === "admin") {
          setPlatformRole("super_admin");
          router.replace("/super");
        } else {
          setPlatformRole("org_admin");

          try {
            // Retrieve projects under this user's organization
            const { data } = await apiClient.get("/projects?page=1&page_size=10");
            const projects = data.items || [];

            if (projects.length > 0) {
              const primaryProject = projects[0];
              
              // Set the platform store context
              setCurrentOrg({
                id: String(primaryProject.organization_id),
                name: "NeoFace Default",
                slug: "neoface-default",
                plan: "pro",
                status: "active",
                industry: "Security & Identity",
                member_count: 0,
                project_count: projects.length,
                device_count: 0,
                auth_count_30d: 0,
                billing_email: "billing@neoface.io",
                owner_name: "Default Admin",
                region: "us-east-1",
                created_at: new Date().toISOString(),
              });
              
              setCurrentProject({
                id: String(primaryProject.id),
                org_id: String(primaryProject.organization_id),
                name: primaryProject.name,
                slug: primaryProject.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                template: "education",
                status: "active",
                subcategories: ["campus_attendance"],
                member_count: 0,
                device_count: 0,
                enrolled_count: 0,
                auth_count_30d: 0,
                created_at: String(primaryProject.created_at),
                updated_at: String(primaryProject.updated_at),
                description: primaryProject.description || "",
                location: "Primary Campus",
              });

              router.replace(`/org/neoface-default/projects/${primaryProject.id}`);
            } else {
              // No projects found — redirect to member self-service portal
              setPlatformRole("member");
              router.replace("/me");
            }
          } catch (projErr) {
            console.error("Failed to load projects, defaulting to member view:", projErr);
            setPlatformRole("member");
            router.replace("/me");
          }
        }
      } catch (err: any) {
        console.error("Auth check failed:", err);
        setError("Session expired. Redirecting to login...");
        
        // Reset auth store context to break stale/expired session redirect loops
        useAuthStore.getState().logout();

        setTimeout(() => {
          router.replace("/login");
        }, 1500);
      }
    }

    resolveRedirect();
  }, [router, setUser, setPlatformRole, setCurrentOrg, setCurrentProject]);


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <div className="absolute inset-0 hero-glow opacity-30 pointer-events-none" />
      <div className="relative flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#00E5A8]" />
        <p className="text-sm font-medium tracking-wide text-white/60">
          {error || "Securing session context..."}
        </p>
      </div>
    </div>
  );
}
