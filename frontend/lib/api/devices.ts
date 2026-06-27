import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export function useDevices(page = 1, pageSize = 20, type?: string, status?: string, search?: string) {
  return useQuery({
    queryKey: ["admin", "devices", { page, pageSize, type, status, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("page_size", String(pageSize));
      if (type) params.append("type", type);
      if (status) params.append("status", status);
      if (search) params.append("search", search);
      const { data } = await apiClient.get(`admin/devices?${params.toString()}`);
      return data;
    },
  });
}

export function useDeviceDetails(deviceId: string) {
  return useQuery({
    queryKey: ["admin", "device", deviceId],
    queryFn: async () => {
      const { data } = await apiClient.get(`admin/devices/${deviceId}`);
      return data;
    },
    enabled: !!deviceId,
  });
}

export function useCreateDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await apiClient.post("admin/devices", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "devices"] });
    },
  });
}

export function useUpdateDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ deviceId, payload }: { deviceId: string; payload: any }) => {
      const { data } = await apiClient.patch(`admin/devices/${deviceId}`, payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "devices"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "device", variables.deviceId] });
    },
  });
}

export function useDeleteDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (deviceId: string) => {
      const { data } = await apiClient.delete(`admin/devices/${deviceId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "devices"] });
    },
  });
}
