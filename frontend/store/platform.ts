import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  UserRole,
  Organization,
  Project,
  Notification,
  BreadcrumbItem,
} from "@/types/platform";

interface PlatformState {
  // Current context
  currentRole: UserRole | null;
  currentOrg: Organization | null;
  currentProject: Project | null;

  // UI state
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  notificationPanelOpen: boolean;
  notifications: Notification[];
  unreadCount: number;
  breadcrumbs: BreadcrumbItem[];

  // Actions
  setRole: (role: UserRole | null) => void;
  setCurrentOrg: (org: Organization | null) => void;
  setCurrentProject: (project: Project | null) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleNotifications: () => void;
  addNotification: (n: Notification) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  setBreadcrumbs: (items: BreadcrumbItem[]) => void;
}

export const usePlatformStore = create<PlatformState>()(
  persist(
    (set, get) => ({
      currentRole: null,
      currentOrg: null,
      currentProject: null,
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      notificationPanelOpen: false,
      breadcrumbs: [],
      notifications: [
        {
          id: "n1",
          type: "alert",
          title: "Device offline",
          message: "Gate Camera A2 at Main Entrance went offline 5 minutes ago.",
          read: false,
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        },
        {
          id: "n2",
          type: "warning",
          title: "Failed auth spike",
          message: "12 failed authentication attempts in the last 10 minutes — Lab Block C.",
          read: false,
          timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
        },
        {
          id: "n3",
          type: "success",
          title: "Bulk enrollment complete",
          message: "847 students enrolled successfully via CSV import.",
          read: true,
          timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
        },
        {
          id: "n4",
          type: "info",
          title: "AI model update",
          message: "FaceNet v3.2 deployed to production. Accuracy improved by 2.3%.",
          read: true,
          timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
        },
      ],

      get unreadCount() {
        return get().notifications.filter((n) => !n.read).length;
      },

      setRole: (role) => set({ currentRole: role }),
      setCurrentOrg: (org) => set({ currentOrg: org }),
      setCurrentProject: (project) => set({ currentProject: project }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      openCommandPalette: () => set({ commandPaletteOpen: true }),
      closeCommandPalette: () => set({ commandPaletteOpen: false }),
      toggleNotifications: () =>
        set((s) => ({ notificationPanelOpen: !s.notificationPanelOpen })),
      addNotification: (n) =>
        set((s) => ({ notifications: [n, ...s.notifications] })),
      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      markAllRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),
      setBreadcrumbs: (items) => set({ breadcrumbs: items }),
    }),
    {
      name: "neoface-platform",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        currentRole: state.currentRole,
      }),
    }
  )
);
