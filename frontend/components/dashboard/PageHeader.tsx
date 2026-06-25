"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BreadcrumbNav } from "./BreadcrumbNav";
import type { BreadcrumbItem } from "@/types/platform";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
  badge?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
  badge,
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn("mb-6 flex items-start justify-between gap-4", className)}
    >
      <div className="min-w-0 flex-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <BreadcrumbNav items={breadcrumbs} className="mb-2" />
        )}
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight text-white">{title}</h1>
          {badge}
        </div>
        {description && (
          <p className="mt-1 text-[12.5px] text-white/40 leading-relaxed">{description}</p>
        )}
      </div>

      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </motion.div>
  );
}
