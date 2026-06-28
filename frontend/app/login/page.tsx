"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, ChevronDown, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { signInWithGoogle, firebaseLogout } from "@/lib/firebase-auth";
import type { User } from "@/types";

// Auth Layout & Subcomponents
import { AuthLayout } from "@/components/dashboard/auth/AuthLayout";
import { AuthInput } from "@/components/dashboard/auth/AuthInput";

const DEMO_ACCOUNTS = [
  {
    role: "Super Admin",
    email: "admin@neoface.io",
    password: "AdminPass123!",
    color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5",
    dot: "bg-indigo-400",
  },
  {
    role: "Org Admin",
    email: "orgadmin@neoface.io",
    password: "AdminPass123!",
    color: "text-sky-400 border-sky-500/20 bg-sky-500/5",
    dot: "bg-sky-400",
  },
  {
    role: "Member",
    email: "member@neoface.io",
    password: "AdminPass123!",
    color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    dot: "bg-emerald-400",
  },
] as const;

function mockUserForEmail(email: string): User {
  const isSuper = email === "admin@neoface.io";
  const isOrg = email === "orgadmin@neoface.io";
  return {
    id: isSuper
      ? "00000000-0000-0000-0000-000000000001"
      : isOrg
      ? "00000000-0000-0000-0000-000000000002"
      : "00000000-0000-0000-0000-000000000003",
    name: isSuper ? "Super Admin" : isOrg ? "Org Admin" : "Member",
    email,
    role: isSuper ? "admin" : "user",
    org_role: isOrg ? "admin" : undefined,
    is_active: true,
    is_enrolled: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

const MOCK_CREDENTIALS: Record<string, string> = {
  "admin@neoface.io": "AdminPass123!",
  "orgadmin@neoface.io": "AdminPass123!",
  "member@neoface.io": "AdminPass123!",
};

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password required"),
});
type Form = z.infer<typeof schema>;

function GoogleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0 transition-transform duration-300 group-hover:scale-105">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [backendDown, setBackendDown] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [successLoginUser, setSuccessLoginUser] = useState<string | null>(null);

  const router = useRouter();
  const { setTokens, setUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && !successLoginUser) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router, successLoginUser]);

  const {
    register, handleSubmit, setValue,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const fillDemo = (email: string, password: string) => {
    setValue("email", email, { shouldValidate: true });
    setValue("password", password, { shouldValidate: true });
    setBackendDown(false);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const fbUser = await signInWithGoogle();
      const idToken = await fbUser.getIdToken();

      try {
        const { data: tokens } = await authApi.googleSignIn(idToken);
        setTokens(tokens.access_token, tokens.refresh_token);
        const { data: user } = await authApi.me();
        
        setSuccessLoginUser(user.name);
        setUser(user);
        toast.success(`Signed in successfully`);
        
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } catch (backendErr: any) {
        console.error("Backend auth exchange failed:", backendErr);
        await firebaseLogout();
        toast.error("Google sign-in is not configured or failed on this server.");
      }
    } catch (err: any) {
      if (err?.code !== "auth/popup-closed-by-user" && err?.code !== "auth/cancelled-popup-request") {
        toast.error("Google sign-in failed — try again");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.getModifierState("CapsLock")) {
      setCapsLockOn(true);
    } else {
      setCapsLockOn(false);
    }
  };

  const onSubmit = async (data: Form) => {
    try {
      const { data: tokens } = await authApi.login(data.email, data.password);
      setTokens(tokens.access_token, tokens.refresh_token);
      const { data: user } = await authApi.me();
      
      setSuccessLoginUser(user.name);
      setUser(user);
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
      return;
    } catch (err: any) {
      const isNetworkError =
        !err?.response ||
        err?.code === "ERR_NETWORK" ||
        err?.code === "ECONNREFUSED";

      if (isNetworkError) {
        const expectedPassword = MOCK_CREDENTIALS[data.email];
        if (expectedPassword && data.password === expectedPassword) {
          const mockUser = mockUserForEmail(data.email);
          setTokens("demo-token-" + data.email, "demo-refresh-" + data.email);
          
          setSuccessLoginUser(mockUser.name);
          setUser(mockUser);
          toast.success(`Demo Mode Access`);
          
          setBackendDown(false);
          setTimeout(() => {
            router.push("/dashboard");
          }, 1500);
          return;
        }
        setBackendDown(true);
        toast.error("Wrong password for demo account");
        return;
      }

      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        toast.error("Invalid email or password");
      } else {
        toast.error("Something went wrong — try again");
      }
      setBackendDown(false);
    }
  };

  return (
    <AuthLayout>
      {/* Brand Anchor Logo with Blue Glow */}
      <div className="flex flex-col items-center mb-4 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative group pointer-events-none"
        >
          {/* Subtle blue radial glow behind logo */}
          <div className="absolute inset-x-0 -inset-y-4 bg-blue-600/[0.08] rounded-full blur-xl scale-125 pointer-events-none" />
          <Image
            src="/newlogo.png"
            alt="NeoFace"
            width={200}
            height={52}
            className="h-8.5 w-auto object-contain relative z-10 brightness-[1.02]"
            priority
          />
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {successLoginUser ? (
          /* SUCCESS REDIRECT VIEW */
          <motion.div
            key="success-screen"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="rounded-[28px] bg-[#0B0B0B]/75 p-6 backdrop-blur-3xl shadow-[0_32px_96px_rgba(0,0,0,0.85)] flex flex-col items-center justify-center text-center min-h-[300px]"
          >
            {/* Morphing success checkmark */}
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 220 }}
              className="h-12 w-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 shadow-[0_0_30px_rgba(37,99,235,0.2)]"
            >
              <CheckCircle2 size={28} strokeWidth={2.2} />
            </motion.div>
            <h3 className="text-lg font-bold text-white tracking-tight leading-none mb-1">Welcome back</h3>
            <p className="text-[12px] text-white/50 mt-1 font-semibold">{successLoginUser}</p>
            
            <div className="w-24 h-[3px] bg-white/[0.06] rounded-full overflow-hidden mt-5 relative">
              <motion.div
                initial={{ left: "-100%" }}
                animate={{ left: "100%" }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-blue-500 to-indigo-400"
              />
            </div>
            <p className="text-[9px] text-white/30 uppercase tracking-[0.25em] mt-3 font-mono">Authenticating securely...</p>
          </motion.div>
        ) : (
          /* PRIMARY AUTHENTICATION CARD */
          <motion.div
            key="login-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="rounded-[28px] bg-[#0B0B0B]/75 p-6 sm:p-7 backdrop-blur-3xl shadow-[0_32px_96px_rgba(0,0,0,0.85)] relative overflow-hidden"
          >
            {/* Subtle card reflection overlay */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

            {/* Typography Overhaul */}
            <div className="text-center mb-5">
              <h2 className="text-2xl font-extrabold text-white tracking-tight leading-none mb-1">Welcome Back</h2>
              <p className="text-[12.5px] text-[#A1A1AA] leading-relaxed max-w-[280px] mx-auto font-medium">
                Continue building secure identity experiences.
              </p>
            </div>

            {/* Google Single Sign-On (Linear Style) */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || isSubmitting}
              className="w-full flex items-center justify-center gap-3 px-4 h-11.5 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/15 active:scale-[0.98] transition-all text-white text-[12.5px] font-semibold tracking-wide disabled:opacity-50 group"
            >
              {googleLoading ? (
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <GoogleIcon />
              )}
              <span>{googleLoading ? "Connecting to Google..." : "Continue with Google"}</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center gap-3.5 my-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/5 to-white/10" />
              <span className="text-[9px] text-white/20 uppercase tracking-[0.22em] font-mono font-semibold shrink-0">or continue with email</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent via-white/5 to-white/10" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <AuthInput
                  label="Email Address"
                  type="email"
                  placeholder="name@company.com"
                  icon={<Mail size={14} className="text-white/25" />}
                  error={errors.email?.message}
                  autoComplete="email"
                  onKeyUp={handleKeyPress}
                  {...register("email")}
                />
              </div>

              <div className="space-y-1">
                <AuthInput
                  label="Password"
                  type={showPass ? "text" : "password"}
                  placeholder="Password"
                  icon={<Lock size={14} className="text-white/25" />}
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="text-white/25 hover:text-white/60 transition-colors cursor-pointer"
                    >
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  }
                  error={errors.password?.message}
                  autoComplete="current-password"
                  onKeyUp={handleKeyPress}
                  {...register("password")}
                />
              </div>

              {/* Caps Lock Indicator */}
              {capsLockOn && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1.5 text-amber-500 text-[10.5px] font-semibold px-1"
                >
                  <AlertCircle size={11} />
                  <span>Caps Lock is active</span>
                </motion.div>
              )}

              <div className="flex justify-end pt-0.5">
                <Link
                  href="/forgot-password"
                  className="text-[11.5px] text-white/40 hover:text-white/70 transition-colors font-semibold"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Primary Button Overhaul: Gradient Electric Blue -> Indigo -> Violet */}
              <button
                type="submit"
                disabled={isSubmitting || googleLoading}
                className="w-full h-11.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:opacity-95 active:scale-[0.98] rounded-xl text-[13px] font-bold tracking-wide flex items-center justify-center gap-1.5 transition-all mt-3 text-white shadow-[0_4px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_4px_25px_rgba(37,99,235,0.35)] hover:-translate-y-0.5"
              >
                {isSubmitting ? (
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight size={13} className="opacity-80 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            {/* Switch to Register link */}
            <div className="mt-5 pt-3.5 border-t border-white/[0.06] text-center">
              <p className="text-[12px] text-white/40 font-semibold">
                New to NeoFace?{" "}
                <Link href="/register" className="text-white hover:underline transition-all">
                  Create an account
                </Link>
              </p>
            </div>

            {/* Slide-out Demo access drawer */}
            <div className="mt-3.5 rounded-xl border border-white/[0.04] bg-white/[0.01] p-1.5 text-center">
              <button
                type="button"
                onClick={() => setShowDemo(!showDemo)}
                className="flex items-center justify-center gap-1 text-[8.5px] font-bold tracking-wider uppercase text-white/35 hover:text-white/50 transition-colors mx-auto"
              >
                <span>Demo access credentials</span>
                <motion.span animate={{ rotate: showDemo ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={10} />
                </motion.span>
              </button>

              <AnimatePresence>
                {showDemo && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden mt-2 space-y-1.5"
                  >
                    {DEMO_ACCOUNTS.map((acc) => (
                      <button
                        key={acc.role}
                        type="button"
                        onClick={() => fillDemo(acc.email, acc.password)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-black/40 border border-white/[0.04] hover:bg-white/[0.03] hover:border-white/10 transition-all text-left"
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${acc.dot}`} />
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-white/95 leading-tight">{acc.role}</p>
                            <p className="text-[9.5px] text-white/30 font-mono truncate">{acc.email}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-white/40 shrink-0 pr-1">Use ↵</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
