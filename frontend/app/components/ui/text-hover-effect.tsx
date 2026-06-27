"use client";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

export const TextHoverEffect = ({
  text,
  duration = 0.5,
}: {
  text: string;
  duration?: number;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  function handleMouseMove(event: React.MouseEvent<SVGSVGElement>) {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setCursor({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  }

  return (
    <svg
      ref={svgRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="select-none w-full h-full"
      viewBox="0 0 1200 240"
    >
      <defs>
        <linearGradient
          id="textGradient"
          gradientUnits="userSpaceOnUse"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          {hovered && (
            <>
              <stop offset="0%" stopColor="#00C2FF" />
              <stop offset="25%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#a78bfa" />
              <stop offset="75%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#f43f5e" />
            </>
          )}
        </linearGradient>

        <motion.radialGradient
          id="revealMask"
          gradientUnits="userSpaceOnUse"
          r="25%"
          animate={
            hovered
              ? {
                  cx: cursor.x,
                  cy: cursor.y,
                }
              : {
                  cx: "50%",
                  cy: "50%",
                }
          }
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
        >
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </motion.radialGradient>

        <mask id="textMask">
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#revealMask)"
          />
        </mask>
      </defs>

      {/* Background outline text */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="1.2"
        className="font-sans font-black fill-transparent stroke-white/[0.06] select-none text-[120px] uppercase tracking-widest"
      >
        {text}
      </text>

      {/* Masked reveal outline text */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="1.2"
        mask="url(#textMask)"
        className="font-sans font-black fill-transparent stroke-[#00E5A8] select-none text-[120px] uppercase tracking-widest"
      >
        {text}
      </text>

      {/* Masked filled text */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        stroke="url(#textGradient)"
        strokeWidth="0.8"
        mask="url(#textMask)"
        className="font-sans font-black fill-transparent text-[120px] uppercase tracking-widest"
      >
        {text}
      </text>
    </svg>
  );
};
