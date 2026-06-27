import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export function useProjects(page = 1, pageSize = 20, orgId?: string, environment?: string, status?: string, search?: string) {
  return useQuery({
    queryKey: ["admin", "projects", { page, pageSize, orgId, environment, status, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("page_size", String(pageSize));
      if (orgId) params.append("org_id", orgId);
      if (environment) params.append("environment", environment);
      if (status) params.append("status", status);
      if (search) params.append("search", search);
      const { data } = await apiClient.get(`admin/projects?${params.toString()}`);
      return data;
    },
  });
}

export function useProjectDetails(projectId: string) {
  return useQuery({
    queryKey: ["admin", "project", projectId],
    queryFn: async () => {
      const { data } = await apiClient.get(`admin/projects/${projectId}`);
      return data;
    },
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orgId, payload }: { orgId: string; payload: any }) => {
      const { data } = await apiClient.post(`admin/projects?org_id=${orgId}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, payload }: { projectId: string; payload: any }) => {
      const { data } = await apiClient.patch(`admin/projects/${projectId}`, payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "project", variables.projectId] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => {
      const { data } = await apiClient.delete(`admin/projects/${projectId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
    },
  });
}
