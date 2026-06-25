"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { BreadcrumbItem } from "@/types/platform";

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function BreadcrumbNav({ items, className }: BreadcrumbNavProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center", className)}>
      <ol className="flex items-center gap-1">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && (
                <ChevronRight className="h-3 w-3 text-white/20 shrink-0" />
              )}
              {isLast || !item.href ? (
                <span
                  className={cn(
                    "text-[11.5px] font-medium",
                    isLast ? "text-white/70" : "text-white/35"
                  )}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-[11.5px] font-medium text-white/35 transition-colors hover:text-white/60"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
