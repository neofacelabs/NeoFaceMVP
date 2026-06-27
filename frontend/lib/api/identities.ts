import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export function useIdentities(
  page = 1,
  pageSize = 20,
  orgId?: string,
  appId?: string,
  enrollmentStatus?: string,
  status?: string,
  identityType?: string,
  siteId?: string,
  search?: string
) {
  return useQuery({
    queryKey: [
      "identities",
      { page, pageSize, orgId, appId, enrollmentStatus, status, identityType, siteId, search },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("page_size", String(pageSize));
      if (orgId) params.append("org_id", orgId);
      if (appId) params.append("application_id", appId);
      if (enrollmentStatus) params.append("enrollment_status", enrollmentStatus);
      if (status) params.append("status", status);
      if (identityType) params.append("identity_type", identityType);
      if (siteId) params.append("site_id", siteId);
      if (search) params.append("search", search);
      
      const { data } = await apiClient.get(`identities?${params.toString()}`);
      return data;
    },
  });
}

export function useIdentityDetails(identityId: string) {
  return useQuery({
    queryKey: ["identity", identityId],
    queryFn: async () => {
      const { data } = await apiClient.get(`identities/${identityId}`);
      return data;
    },
    enabled: !!identityId,
  });
}

export function useCreateIdentity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      external_user_id: string;
      application_id: string;
      identity_type?: string;
      site_id?: string;
    }) => {
      const { data } = await apiClient.post("identities", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["identities"] });
    },
  });
}

export function useUpdateIdentity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ identityId, payload }: { identityId: string; payload: any }) => {
      const { data } = await apiClient.patch(`identities/${identityId}`, payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["identities"] });
      queryClient.invalidateQueries({ queryKey: ["identity", variables.identityId] });
    },
  });
}

export function useResetBiometrics() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (identityId: string) => {
      const { data } = await apiClient.post(`identities/${identityId}/reset-biometrics`);
      return data;
    },
    onSuccess: (_, identityId) => {
      queryClient.invalidateQueries({ queryKey: ["identities"] });
      queryClient.invalidateQueries({ queryKey: ["identity", identityId] });
    },
  });
}

export function useDeleteIdentity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (identityId: string) => {
      const { data } = await apiClient.delete(`identities/${identityId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["identities"] });
    },
  });
}
