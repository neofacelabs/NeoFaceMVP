"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

// Auth Layout & Subcomponents
import { AuthLayout } from "@/components/dashboard/auth/AuthLayout";
import { AuthInput } from "@/components/dashboard/auth/AuthInput";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});
type Form = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSuccess(true);
      toast.success("Reset email sent if account exists");
    } catch (err: any) {
      toast.error("Failed to send reset email");
    } finally {
      setSubmitting(false);
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
        {success ? (
          /* SUCCESS RESET VIEW */
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
            <h3 className="text-xl font-bold text-white tracking-tight leading-none mb-1.5">Check your email</h3>
            <p className="text-[13px] text-white/50 mt-1 font-semibold leading-relaxed max-w-[280px] mx-auto">
              We have sent password reset instructions to your inbox.
            </p>
            
            <Link
              href="/login"
              className="flex items-center justify-center gap-1.5 mt-8 text-xs font-semibold text-white bg-white/[0.04] border border-white/[0.07] px-5 py-2.5 rounded-xl transition-all"
            >
              <ArrowLeft size={13} />
              <span>Back to Login</span>
            </Link>
          </motion.div>
        ) : (
          /* FORGOT PASSWORD FORM */
          <motion.div
            key="forgot-password-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="rounded-[28px] bg-[#0B0B0B]/75 p-6 sm:p-7 backdrop-blur-3xl shadow-[0_32px_96px_rgba(0,0,0,0.85)] relative overflow-hidden"
          >
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

            {/* Typography Overhaul */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-extrabold text-white tracking-tight leading-none mb-1.5">Reset Password</h2>
              <p className="text-[13px] text-[#A1A1AA] leading-relaxed max-w-[280px] mx-auto font-medium">
                Enter your email address and we will send a secure link to restore your account.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <AuthInput
                label="Email Address"
                type="email"
                placeholder="name@company.com"
                icon={<Mail size={14} className="text-white/25" />}
                error={errors.email?.message}
                autoComplete="email"
                {...register("email")}
              />

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:opacity-95 active:scale-[0.98] rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5 transition-all mt-4 text-white shadow-[0_4px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_4px_25px_rgba(37,99,235,0.35)] hover:-translate-y-0.5"
              >
                {submitting ? (
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight size={13} className="opacity-80 shrink-0" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center pt-2">
                <Link
                  href="/login"
                  className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors font-semibold"
                >
                  <ArrowLeft size={13} />
                  <span>Back to Login</span>
                </Link>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
