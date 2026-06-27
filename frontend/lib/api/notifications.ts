import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export function useBroadcasts() {
  return useQuery({
    queryKey: ["admin", "broadcasts"],
    queryFn: async () => {
      const { data } = await apiClient.get("admin/notifications/broadcasts");
      return data;
    },
  });
}

export function useCreateBroadcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { title: string; message: string; severity?: string; target?: string }) => {
      const { data } = await apiClient.post("admin/notifications/broadcasts", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "broadcasts"] });
    },
  });
}

export function useDeleteBroadcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`admin/notifications/broadcasts/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "broadcasts"] });
    },
  });
}
