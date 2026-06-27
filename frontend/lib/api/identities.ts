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
  search?: string
) {
  return useQuery({
    queryKey: [
      "admin",
      "identities",
      { page, pageSize, orgId, appId, enrollmentStatus, status, identityType, search },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("page_size", String(pageSize));
      if (orgId) params.append("org_id", orgId);
      if (appId) params.append("app_id", appId);
      if (enrollmentStatus) params.append("enrollment_status", enrollmentStatus);
      if (status) params.append("status", status);
      if (identityType) params.append("identity_type", identityType);
      if (search) params.append("search", search);
      
      const { data } = await apiClient.get(`admin/identities?${params.toString()}`);
      return data;
    },
  });
}

export function useIdentityDetails(identityId: string) {
  return useQuery({
    queryKey: ["admin", "identity", identityId],
    queryFn: async () => {
      const { data } = await apiClient.get(`admin/identities/${identityId}`);
      return data;
    },
    enabled: !!identityId,
  });
}

export function useUpdateIdentity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ identityId, payload }: { identityId: string; payload: any }) => {
      const { data } = await apiClient.patch(`admin/identities/${identityId}`, payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "identities"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "identity", variables.identityId] });
    },
  });
}

export function useResetBiometrics() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (identityId: string) => {
      const { data } = await apiClient.post(`admin/identities/${identityId}/reset-biometrics`);
      return data;
    },
    onSuccess: (_, identityId) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "identities"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "identity", identityId] });
    },
  });
}

export function useDeleteIdentity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (identityId: string) => {
      const { data } = await apiClient.delete(`admin/identities/${identityId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "identities"] });
    },
  });
}
