"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console / monitoring service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-6">
      <div className="w-14 h-14 rounded-2xl bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.18)] flex items-center justify-center text-[#f87171] animate-pulse">
        <AlertCircle size={28} />
      </div>

      <div className="space-y-2">
        <h2 className="text-[17px] font-bold text-white tracking-tight">Workspace Error</h2>
        <p className="text-[13px] text-[rgba(255,255,255,0.4)] max-w-md mx-auto leading-relaxed">
          An unexpected error occurred while loading this dashboard view. Your session context is intact.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12.5px] font-semibold text-black bg-[#00C2FF] hover:bg-[#0096c7] transition-all"
        >
          <RotateCcw size={13} /> Retry View
        </button>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12.5px] font-semibold text-[rgba(255,255,255,0.75)] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.08)] transition-all"
        >
          <Home size={13} /> Go Home
        </Link>
      </div>
    </div>
  );
}
