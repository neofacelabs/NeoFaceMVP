import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export function useAuditLogs(page = 1, pageSize = 50, search?: string) {
  return useQuery({
    queryKey: ["admin", "audit-logs", { page, pageSize, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("page_size", String(pageSize));
      if (search) params.append("search", search);
      const { data } = await apiClient.get(`admin/audit-logs?${params.toString()}`);
      return data;
    },
  });
}
