import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export function useWebhooks(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ["admin", "webhooks", { page, pageSize }],
    queryFn: async () => {
      const { data } = await apiClient.get(`admin/integrations/webhooks?page=${page}&page_size=${pageSize}`);
      return data;
    },
  });
}

export function useWebhookDeliveries(limit = 20) {
  return useQuery({
    queryKey: ["admin", "webhook-deliveries", limit],
    queryFn: async () => {
      const { data } = await apiClient.get(`admin/integrations/webhook-deliveries?limit=${limit}`);
      return data;
    },
  });
}

export function useApiKeyMetrics() {
  return useQuery({
    queryKey: ["admin", "api-key-metrics"],
    queryFn: async () => {
      const { data } = await apiClient.get("admin/integrations/api-keys/metrics");
      return data;
    },
  });
}
