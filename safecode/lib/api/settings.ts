import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export function useSystemSettings() {
  return useQuery({
    queryKey: ["admin", "system-settings"],
    queryFn: async () => {
      const { data } = await apiClient.get("admin/settings");
      return data;
    },
  });
}

export function useUpdateSystemSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await apiClient.patch("admin/settings", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "system-settings"] });
    },
  });
}
