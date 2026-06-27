"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface MenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
  gradient: string;
  iconColor: string;
}

interface MenuBarProps {
  items: MenuItem[];
  activeItem: string;
  onItemClick: (label: string) => void;
}

export function MenuBar({ items, activeItem, onItemClick }: MenuBarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div className="relative inline-flex items-center gap-2 bg-black/40 border border-white/[0.08] backdrop-blur-[20px] rounded-full p-2.5 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
      
      {/* Background Gradient Halo (follows hovered or active item) */}
      {items.map((item) => {
        const isHovered = hoveredItem === item.label;
        const isActive = activeItem === item.label;
        
        return (
          <div
            key={item.label + "-glow"}
            className="absolute inset-0 pointer-events-none transition-opacity duration-500 rounded-full"
            style={{
              background: item.gradient,
              opacity: isHovered ? 1 : isActive ? 0.4 : 0,
              zIndex: -1,
            }}
          />
        );
      })}

      {/* Menu items */}
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeItem === item.label;
        const isHovered = hoveredItem === item.label;

        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={() => onItemClick(item.label)}
            onMouseEnter={() => setHoveredItem(item.label)}
            onMouseLeave={() => setHoveredItem(null)}
            className="relative px-5 py-3 rounded-full flex items-center gap-2.5 transition-colors duration-300 select-none group"
          >
            {/* Slide active indicator */}
            {isActive && (
              <motion.div
                layoutId="active-pill"
                className="absolute inset-0 bg-white/[0.07] border border-white/[0.08] rounded-full z-0"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}

            {/* Hover indicator */}
            {isHovered && !isActive && (
              <motion.div
                layoutId="hover-pill"
                className="absolute inset-0 bg-white/[0.02] border border-white/[0.04] rounded-full z-0"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}

            <div className={`relative z-10 transition-transform duration-300 group-hover:scale-110 transition-colors duration-300 ${
              isActive ? "text-white" : "text-white/55 group-hover:text-white"
            }`}>
              <Icon className="w-[18px] h-[18px] stroke-[2.2]" />
            </div>
            
            <span className={`relative z-10 font-mono text-[11px] uppercase tracking-wider transition-colors duration-300 ${
              isActive ? "text-white" : "text-white/55 group-hover:text-white"
            }`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
