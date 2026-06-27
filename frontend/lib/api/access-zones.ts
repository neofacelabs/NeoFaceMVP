import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export function useAccessZones(page = 1, pageSize = 50, siteId?: string, search?: string) {
  return useQuery({
    queryKey: ["access-zones", { page, pageSize, siteId, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("page_size", String(pageSize));
      if (siteId) params.append("site_id", siteId);
      if (search) params.append("search", search);
      const { data } = await apiClient.get(`access-zones?${params.toString()}`);
      return data;
    },
  });
}

export function useAccessZoneDetails(zoneId: string) {
  return useQuery({
    queryKey: ["access-zone", zoneId],
    queryFn: async () => {
      const { data } = await apiClient.get(`access-zones/${zoneId}`);
      return data;
    },
    enabled: !!zoneId,
  });
}

export function useCreateAccessZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      description?: string;
      site_id?: string;
      allowed_identities?: string[];
      allowed_projects?: string[];
      allowed_schedule?: any;
      assigned_devices?: string[];
      security_policies?: any;
    }) => {
      const { data } = await apiClient.post("access-zones", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["access-zones"] });
    },
  });
}

export function useUpdateAccessZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ zoneId, payload }: { zoneId: string; payload: any }) => {
      const { data } = await apiClient.patch(`access-zones/${zoneId}`, payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["access-zones"] });
      queryClient.invalidateQueries({ queryKey: ["access-zone", variables.zoneId] });
    },
  });
}

export function useDeleteAccessZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (zoneId: string) => {
      const { data } = await apiClient.delete(`access-zones/${zoneId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["access-zones"] });
    },
  });
}
