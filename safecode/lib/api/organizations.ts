import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export function useOrganizations(page = 1, pageSize = 20, status?: string, search?: string) {
  return useQuery({
    queryKey: ["admin", "organizations", { page, pageSize, status, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("page_size", String(pageSize));
      if (status) params.append("status", status);
      if (search) params.append("search", search);
      const { data } = await apiClient.get(`admin/organizations?${params.toString()}`);
      return data;
    },
  });
}

export function useOrganizationDetails(orgId: string) {
  return useQuery({
    queryKey: ["admin", "organization", orgId],
    queryFn: async () => {
      const { data } = await apiClient.get(`admin/organizations/${orgId}`);
      return data;
    },
    enabled: !!orgId,
  });
}

export function useOrganizationAnalytics(orgId: string) {
  return useQuery({
    queryKey: ["admin", "organization-analytics", orgId],
    queryFn: async () => {
      const { data } = await apiClient.get(`admin/organizations/${orgId}/analytics`);
      return data;
    },
    enabled: !!orgId,
  });
}

export function useOrganizationActivity(orgId: string, page = 1) {
  return useQuery({
    queryKey: ["admin", "organization-activity", orgId, page],
    queryFn: async () => {
      const { data } = await apiClient.get(`admin/organizations/${orgId}/activity?page=${page}`);
      return data;
    },
    enabled: !!orgId,
  });
}

export function useOrganizationUsage(orgId: string) {
  return useQuery({
    queryKey: ["admin", "organization-usage", orgId],
    queryFn: async () => {
      const { data } = await apiClient.get(`admin/organizations/${orgId}/usage`);
      return data;
    },
    enabled: !!orgId,
  });
}

export function useOrganizationSettings(orgId: string) {
  return useQuery({
    queryKey: ["admin", "organization-settings", orgId],
    queryFn: async () => {
      const { data } = await apiClient.get(`admin/organizations/${orgId}/settings`);
      return data;
    },
    enabled: !!orgId,
  });
}

export function useOrganizationBilling(orgId: string) {
  return useQuery({
    queryKey: ["admin", "organization-billing", orgId],
    queryFn: async () => {
      const { data } = await apiClient.get(`admin/organizations/${orgId}/billing`);
      return data;
    },
    enabled: !!orgId,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; slug: string; plan?: string }) => {
      const { data } = await apiClient.post("admin/organizations", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "organizations"] });
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orgId, payload }: { orgId: string; payload: any }) => {
      const { data } = await apiClient.patch(`admin/organizations/${orgId}`, payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "organizations"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "organization", variables.orgId] });
    },
  });
}

export function useUpdateOrganizationSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orgId, payload }: { orgId: string; payload: any }) => {
      const { data } = await apiClient.patch(`admin/organizations/${orgId}/settings`, payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "organization-settings", variables.orgId] });
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orgId: string) => {
      const { data } = await apiClient.delete(`admin/organizations/${orgId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "organizations"] });
    },
  });
}
