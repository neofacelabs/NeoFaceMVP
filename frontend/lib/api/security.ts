import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export function useSecurityAlerts(limit = 20) {
  return useQuery({
    queryKey: ["admin", "security-alerts", limit],
    queryFn: async () => {
      const { data } = await apiClient.get(`admin/security/threat-alerts?limit=${limit}`);
      return data;
    },
  });
}

export function useAccessControl() {
  return useQuery({
    queryKey: ["admin", "access-control"],
    queryFn: async () => {
      const { data } = await apiClient.get("admin/security/access-control");
      return data;
    },
  });
}

export function useModifyAccessControl() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { action: string; ip: string }) => {
      const { data } = await apiClient.post("admin/security/access-control", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "access-control"] });
    },
  });
}

export function useLockdown() {
  return useMutation({
    mutationFn: async (payload: { scope: string; target_id?: string }) => {
      const { data } = await apiClient.post("admin/security/lockdown", payload);
      return data;
    },
  });
}

export function useReleaseLockdown() {
  return useMutation({
    mutationFn: async (payload: { scope: string; target_id?: string }) => {
      const { data } = await apiClient.post("admin/security/lockdown/release", payload);
      return data;
    },
  });
}
