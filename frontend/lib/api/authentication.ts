import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export function useAuthStats(days = 30) {
  return useQuery({
    queryKey: ["admin", "auth-stats", days],
    queryFn: async () => {
      const { data } = await apiClient.get(`admin/authentication/stats?days=${days}`);
      return data;
    },
  });
}

export function useAuthLogs(page = 1, pageSize = 20, orgId?: string, status?: boolean) {
  return useQuery({
    queryKey: ["admin", "auth-logs", { page, pageSize, orgId, status }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("page_size", String(pageSize));
      if (orgId) params.append("org_id", orgId);
      if (status !== undefined) params.append("status", String(status));
      const { data } = await apiClient.get(`admin/authentication/logs?${params.toString()}`);
      return data;
    },
  });
}
