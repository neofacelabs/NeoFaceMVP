"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonCardProps {
  lines?: number;
  hasHeader?: boolean;
  className?: string;
}

export function SkeletonCard({ lines = 3, hasHeader = true, className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "rounded-[14px] border border-white/[0.065] bg-white/[0.025] p-5",
        className
      )}
    >
      {hasHeader && (
        <div className="mb-4 flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-2 w-1/4" />
          </div>
        </div>
      )}
      <div className="space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className={cn("h-3", i === lines - 1 ? "w-2/3" : "w-full")} />
        ))}
      </div>
    </div>
  );
}

export function KPISkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className={cn("grid gap-4", count === 4 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : count === 3 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 sm:grid-cols-2")}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-[14px] border border-white/[0.065] bg-white/[0.025] p-5">
          <Skeleton className="mb-3 h-2 w-1/3" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="mt-2 h-2 w-1/4" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex gap-4 border-b border-white/[0.055] py-2.5 px-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className={cn("h-2 flex-1", i === 0 ? "max-w-[100px]" : "")} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, ri) => (
        <div key={ri} className="flex gap-4 border-b border-white/[0.04] py-3 px-3">
          {Array.from({ length: cols }).map((_, ci) => (
            <Skeleton key={ci} className={cn("h-3 flex-1", ci === 0 ? "max-w-[120px]" : "")} />
          ))}
        </div>
      ))}
    </div>
  );
}
