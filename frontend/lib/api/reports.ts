import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export function useReportTemplates() {
  return useQuery({
    queryKey: ["admin", "report-templates"],
    queryFn: async () => {
      const { data } = await apiClient.get("admin/reports/templates");
      return data;
    },
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: async ({ templateId, format, orgId }: { templateId: string; format: string; orgId?: string }) => {
      const params = new URLSearchParams();
      params.append("template_id", templateId);
      params.append("format", format);
      if (orgId) params.append("org_id", orgId);
      
      // Request download link or trigger download programmatically
      const response = await apiClient.get(`admin/reports/export?${params.toString()}`, {
        responseType: "blob"
      });
      return response.data;
    }
  });
}
