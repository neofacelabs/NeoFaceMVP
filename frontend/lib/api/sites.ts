import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export function useSites(page = 1, pageSize = 50, status?: string, search?: string) {
  return useQuery({
    queryKey: ["sites", { page, pageSize, status, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("page_size", String(pageSize));
      if (status) params.append("status", status);
      if (search) params.append("search", search);
      const { data } = await apiClient.get(`sites?${params.toString()}`);
      return data;
    },
  });
}

export function useSiteDetails(siteId: string) {
  return useQuery({
    queryKey: ["site", siteId],
    queryFn: async () => {
      const { data } = await apiClient.get(`sites/${siteId}`);
      return data;
    },
    enabled: !!siteId,
  });
}

export function useCreateSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; description?: string }) => {
      const { data } = await apiClient.post("sites", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sites"] });
    },
  });
}

export function useUpdateSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ siteId, payload }: { siteId: string; payload: any }) => {
      const { data } = await apiClient.patch(`sites/${siteId}`, payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sites"] });
      queryClient.invalidateQueries({ queryKey: ["site", variables.siteId] });
    },
  });
}

export function useDeleteSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (siteId: string) => {
      const { data } = await apiClient.delete(`sites/${siteId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sites"] });
    },
  });
}
