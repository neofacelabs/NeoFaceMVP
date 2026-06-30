import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export function useAnalyticsOverview(days = 30) {
  return useQuery({
    queryKey: ["analytics", "overview", { days }],
    queryFn: async () => {
      const { data } = await apiClient.get(`analytics/overview?days=${days}`);
      return data;
    },
  });
}

export function useAnalyticsUsage(days = 30, appId?: string) {
  return useQuery({
    queryKey: ["analytics", "usage", { days, appId }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("days", String(days));
      if (appId) params.append("application_id", appId);
      const { data } = await apiClient.get(`analytics/usage?${params.toString()}`);
      return data;
    },
  });
}

export function useAnalyticsAuthentication(days = 30) {
  return useQuery({
    queryKey: ["analytics", "authentication", { days }],
    queryFn: async () => {
      const { data } = await apiClient.get(`analytics/authentication?days=${days}`);
      return data;
    },
  });
}
