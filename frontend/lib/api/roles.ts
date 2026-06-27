import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export function useMembersAndRoles(page = 1, pageSize = 50) {
  return useQuery({
    queryKey: ["members-roles", { page, pageSize }],
    queryFn: async () => {
      // In the backend, user list acts as members list.
      // But we can check org memberships by querying the users API or organization members API.
      const { data } = await apiClient.get(`users?page=${page}&page_size=${pageSize}`);
      return data;
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      // Endpoint updates user's role/permissions
      const { data } = await apiClient.patch(`users/${userId}`, { role });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members-roles"] });
    },
  });
}
