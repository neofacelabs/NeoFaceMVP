"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Shield, Building2, Save, Trash2, Key, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingOrg, setSavingOrg] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orgName, setOrgName] = useState("NeoFace Labs Default");
  const [orgSlug, setOrgSlug] = useState("neoface-default");
  
  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setSavingProfile(true);
    try {
      const { data } = await apiClient.patch(`users/${user.id}`, { name });
      setUser(data);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      const msg = error?.response?.data?.detail || "Failed to update profile";
      toast.error(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingOrg(true);
    await new Promise(r => setTimeout(r, 800)); // Simulate save
    toast.success("Organization settings saved");
    setSavingOrg(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    toast.loading("Updating password...");
    await new Promise(r => setTimeout(r, 1000)); // Mock backend change password
    toast.dismiss();
    toast.success("Password updated successfully");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleDeactivate = async () => {
    if (!confirm("Are you sure you want to deactivate your workspace? This will suspend all API access immediately.")) {
      return;
    }
    setDeactivating(true);
    try {
      toast.success("Workspace access suspended. Re-authenticate to restore.");
      // Simulated logout/deactivate
      const { logout } = useAuthStore.getState();
      logout();
      window.location.href = "/login";
    } catch {
      toast.error("Failed to deactivate account");
    } finally {
      setDeactivating(false);
    }
  };

  const cardClass = "rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.025)] overflow-hidden";

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-[13px] text-[rgba(255,255,255,0.35)] mt-0.5">Manage your workspace configuration and profile preferences</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[rgba(255,255,255,0.25)] px-3 mb-2">Settings Sections</p>
          {[
            { label: "Profile", icon: User, target: "#profile" },
            { label: "Organization", icon: Building2, target: "#organization" },
            { label: "Security", icon: Shield, target: "#security" },
          ].map(item => (
            <a key={item.label} href={item.target}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12.5px] font-medium text-[rgba(255,255,255,0.5)] hover:text-white hover:bg-[rgba(255,255,255,0.025)] transition-all">
              <item.icon size={13} />
              {item.label}
            </a>
          ))}
        </div>

        {/* Content Panel */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Profile Section */}
          <motion.div id="profile" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={cardClass}>
            <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)] flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[rgba(0,194,255,0.1)] flex items-center justify-center">
                <User size={13} className="text-[#00C2FF]" />
              </div>
              <h2 className="text-sm font-semibold text-white">Profile Settings</h2>
            </div>
            <form onSubmit={handleSaveProfile} className="p-5 space-y-4">
              <Input
                label="Full Name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Name"
              />
              <Input
                label="Email Address"
                value={email}
                disabled
                placeholder="your@email.com"
                type="email"
              />
              <div className="flex justify-end pt-2">
                <button type="submit" disabled={savingProfile}
                  className="btn-accent px-4 py-2 rounded-xl text-[12.5px] font-semibold text-white flex items-center gap-2 disabled:opacity-50">
                  {savingProfile ? <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" /> : <Save size={12} />}
                  Save Profile
                </button>
              </div>
            </form>
          </motion.div>

          {/* Organization Section */}
          <motion.div id="organization" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={cardClass}>
            <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)] flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[rgba(0,229,168,0.1)] flex items-center justify-center">
                <Building2 size={13} className="text-[#00E5A8]" />
              </div>
              <h2 className="text-sm font-semibold text-white">Organization Settings</h2>
            </div>
            <form onSubmit={handleSaveOrg} className="p-5 space-y-4">
              <Input
                label="Organization Name"
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                placeholder="NeoFace Default"
              />
              <Input
                label="Organization Slug"
                value={orgSlug}
                onChange={e => setOrgSlug(e.target.value)}
                placeholder="neoface-default"
              />
              <div className="flex justify-end pt-2">
                <button type="submit" disabled={savingOrg}
                  className="px-4 py-2 rounded-xl text-[12.5px] font-semibold text-[#00E5A8] bg-[rgba(0,229,168,0.08)] border border-[rgba(0,229,168,0.18)] hover:bg-[rgba(0,229,168,0.12)] flex items-center gap-2 disabled:opacity-50">
                  {savingOrg ? <span className="animate-spin h-3.5 w-3.5 border-2 border-[#00E5A8] border-t-transparent rounded-full" /> : <Save size={12} />}
                  Save Workspace
                </button>
              </div>
            </form>
          </motion.div>

          {/* Security Section */}
          <motion.div id="security" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={cardClass}>
            <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)] flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[rgba(129,140,248,0.1)] flex items-center justify-center">
                <Shield size={13} className="text-[#818cf8]" />
              </div>
              <h2 className="text-sm font-semibold text-white">Change Password</h2>
            </div>
            <form onSubmit={handleUpdatePassword} className="p-5 space-y-4">
              <Input
                label="Current Password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                type="password"
              />
              <Input
                label="New Password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
                type="password"
              />
              <Input
                label="Confirm New Password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                type="password"
              />
              <div className="flex justify-end pt-2">
                <button type="submit"
                  className="px-4 py-2 rounded-xl text-[12.5px] font-semibold text-[#818cf8] bg-[rgba(129,140,248,0.08)] border border-[rgba(129,140,248,0.18)] hover:bg-[rgba(129,140,248,0.12)] flex items-center gap-2">
                  <Key size={12} /> Update Password
                </button>
              </div>
            </form>
          </motion.div>

          {/* Danger Zone */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-2xl border border-[rgba(248,113,113,0.18)] bg-[rgba(248,113,113,0.02)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[rgba(248,113,113,0.12)] flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[rgba(248,113,113,0.1)] flex items-center justify-center">
                <Trash2 size={13} className="text-[#f87171]" />
              </div>
              <h2 className="text-sm font-semibold text-white">Danger Zone</h2>
            </div>
            <div className="p-5 flex items-start justify-between flex-wrap gap-4">
              <div className="max-w-[400px]">
                <p className="text-[13px] font-semibold text-white">Deactivate Workspace</p>
                <p className="text-[11.5px] text-[rgba(255,255,255,0.4)] mt-1">
                  Deactivating this workspace will immediately disable all API keys, cancel webhook delivery, and block dashboard access for team members.
                </p>
              </div>
              <button onClick={handleDeactivate} disabled={deactivating}
                className="px-4 py-2.5 rounded-xl text-[12.5px] font-semibold text-white bg-[#ef4444] hover:bg-[#dc2626] transition-all flex items-center gap-2">
                <Trash2 size={12} /> Deactivate
              </button>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
