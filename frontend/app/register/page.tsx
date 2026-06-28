"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Check, CheckCircle2, Cpu, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { cn, extractErrorMsg } from "@/lib/utils";

// Auth Layout & Subcomponents
import { AuthLayout } from "@/components/dashboard/auth/AuthLayout";
import { AuthInput } from "@/components/dashboard/auth/AuthInput";

const schema = z.object({
  name:     z.string().min(2, "Name must be at least 2 characters"),
  email:    z.string().email("Enter a valid email"),
  password: z.string()
    .min(8, "Minimum 8 characters")
    .regex(/[A-Z]/, "Include one uppercase letter")
    .regex(/[0-9]/, "Include one number"),
  confirm:  z.string(),
  // Step 2 Fields
  orgName:  z.string().min(2, "Organization name required"),
  industry: z.string().optional(),
}).refine((d) => d.password === d.confirm, {
  message: "Passwords do not match",
  path: ["confirm"],
});
type Form = z.infer<typeof schema>;

const RULES = [
  { label: "8+ chars", test: (p: string) => p.length >= 8 },
  { label: "Uppercase", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Number",    test: (p: string) => /[0-9]/.test(p) },
];

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showPass, setShowPass] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, watch, trigger, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirm: "",
      orgName: "",
      industry: "technology",
    }
  });

  const password = watch("password", "");

  const handleNextStep = async () => {
    const isStep1Valid = await trigger(["name", "email", "password", "confirm"]);
    if (isStep1Valid) {
      setStep(2);
    } else {
      toast.error("Please resolve validation errors in step 1");
    }
  };

  const onSubmit = async (data: Form) => {
    try {
      await authApi.register({ name: data.name, email: data.email, password: data.password });
      toast.success("Account created successfully");
      setStep(3);
      setTimeout(() => {
        router.push("/login");
      }, 1800);
    } catch (err: any) {
      toast.error(extractErrorMsg(err, "Registration failed"));
    }
  };

  return (
    <AuthLayout>
      {/* Brand Anchor Logo with Blue Glow */}
      <div className="flex flex-col items-center mb-4 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative group pointer-events-none"
        >
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
        {step === 3 ? (
          /* STEP 3: SUCCESS CONFIRMATION VIEW */
          <motion.div
            key="success-screen"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="rounded-[28px] bg-[#0B0B0B]/75 p-6 backdrop-blur-3xl shadow-[0_32px_96px_rgba(0,0,0,0.85)] flex flex-col items-center justify-center text-center min-h-[300px]"
          >
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 220 }}
              className="h-12 w-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 shadow-[0_0_30px_rgba(37,99,235,0.25)]"
            >
              <CheckCircle2 size={28} strokeWidth={2.2} />
            </motion.div>
            <h3 className="text-lg font-bold text-white tracking-tight leading-none mb-1">Account Created</h3>
            <p className="text-[12px] text-white/50 mt-1 font-semibold">Welcome to the future of biometric trust</p>
            
            <div className="w-24 h-[3px] bg-white/[0.06] rounded-full overflow-hidden mt-5 relative">
              <motion.div
                initial={{ left: "-100%" }}
                animate={{ left: "100%" }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-blue-500 to-indigo-400"
              />
            </div>
            <p className="text-[9px] text-white/30 uppercase tracking-[0.25em] mt-3 font-mono">Redirecting you to sign in...</p>
          </motion.div>
        ) : (
          /* STEP 1 & 2 FORM */
          <motion.div
            key="register-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="rounded-[28px] bg-[#0B0B0B]/75 p-6 sm:p-7 backdrop-blur-3xl shadow-[0_32px_96px_rgba(0,0,0,0.85)] relative overflow-hidden"
          >
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

            {/* Step Indicators */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className={cn("h-1 flex-1 rounded-full transition-all duration-300", step >= 1 ? "bg-blue-500" : "bg-white/10")} />
              <div className={cn("h-1 flex-1 rounded-full transition-all duration-300", step >= 2 ? "bg-blue-500" : "bg-white/10")} />
            </div>

            {/* Typography Overhaul */}
            <div className="text-center mb-5">
              <h2 className="text-2xl font-extrabold text-white tracking-tight leading-none mb-1.5">
                {step === 1 ? "Create Account" : "Organization"}
              </h2>
              <p className="text-[13px] text-[#A1A1AA] leading-relaxed max-w-[280px] mx-auto font-medium">
                {step === 1 ? "Start building high-trust applications." : "Configure your tenant workspace."}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {step === 1 && (
                /* STEP 1: CREDENTIALS */
                <div className="space-y-4">
                  <AuthInput
                    label="Full Name"
                    placeholder="Alex Johnson"
                    icon={<User size={14} className="text-white/25" />}
                    error={errors.name?.message}
                    autoComplete="name"
                    {...register("name")}
                  />

                  <AuthInput
                    label="Email Address"
                    type="email"
                    placeholder="name@company.com"
                    icon={<Mail size={14} className="text-white/25" />}
                    error={errors.email?.message}
                    autoComplete="email"
                    {...register("email")}
                  />

                  <AuthInput
                    label="Password"
                    type={showPass ? "text" : "password"}
                    placeholder="Password (8+ chars)"
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
                    autoComplete="new-password"
                    {...register("password")}
                  />

                  {/* Clean checks list */}
                  {password.length > 0 && (
                    <div className="flex gap-4 pt-1 px-1 justify-between">
                      {RULES.map((r) => {
                        const passed = r.test(password);
                        return (
                          <div
                            key={r.label}
                            className={cn(
                              "flex items-center gap-1 text-[10px] font-semibold transition-colors",
                              passed ? "text-emerald-400" : "text-white/15"
                            )}
                          >
                            <Check size={9} strokeWidth={3} />
                            <span>{r.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <AuthInput
                    label="Confirm Password"
                    type="password"
                    placeholder="Confirm Password"
                    icon={<Lock size={14} className="text-white/25" />}
                    error={errors.confirm?.message}
                    autoComplete="new-password"
                    {...register("confirm")}
                  />

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full h-11.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:opacity-95 active:scale-[0.98] rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5 transition-all mt-4 text-white shadow-[0_4px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_4px_25px_rgba(37,99,235,0.35)] hover:-translate-y-0.5"
                  >
                    <span>Next step</span>
                    <ArrowRight size={13} className="opacity-80 shrink-0" />
                  </button>
                </div>
              )}

              {step === 2 && (
                /* STEP 2: ORGANIZATIONS */
                <div className="space-y-4">
                  <AuthInput
                    label="Organization Name"
                    placeholder="Acme Corporation"
                    icon={<Cpu size={14} className="text-white/25" />}
                    error={errors.orgName?.message}
                    {...register("orgName")}
                  />

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-white/40 tracking-wider uppercase">
                      Industry
                    </label>
                    <select
                      className="flex h-11.5 w-full items-center justify-between rounded-xl border bg-white/[0.01] border-white/10 px-3.5 py-2 text-[13px] text-white outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer hover:border-white/15"
                      {...register("industry")}
                    >
                      <option value="technology" className="bg-[#050505] text-white">Technology & SaaS</option>
                      <option value="finance" className="bg-[#050505] text-white">Banking & Fintech</option>
                      <option value="healthcare" className="bg-[#050505] text-white">Healthcare & Biotech</option>
                      <option value="government" className="bg-[#050505] text-white">Government & Security</option>
                      <option value="education" className="bg-[#050505] text-white">Higher Education</option>
                    </select>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-1/3 h-11.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.07] rounded-xl text-[13px] font-semibold text-white flex items-center justify-center gap-1.5 transition-all"
                    >
                      <ArrowLeft size={13} />
                      <span>Back</span>
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-2/3 h-11.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:opacity-95 active:scale-[0.98] rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5 transition-all text-white shadow-[0_4px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_4px_25px_rgba(37,99,235,0.35)] hover:-translate-y-0.5"
                    >
                      {isSubmitting ? (
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <>
                          <span>Create Account</span>
                          <ArrowRight size={13} className="opacity-80 shrink-0" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Switch to Login link */}
            <div className="mt-5 pt-3.5 border-t border-white/[0.06] text-center">
              <p className="text-[12px] text-white/40 font-semibold">
                Already have an account?{" "}
                <Link href="/login" className="text-white hover:underline transition-all">
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
