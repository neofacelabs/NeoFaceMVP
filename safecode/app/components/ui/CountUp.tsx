"use client";

import React, { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";

interface CountUpProps {
  end: number;
  decimals?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

export function CountUp({ end, decimals = 0, duration = 1.5, prefix = "", suffix = "" }: CountUpProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!inView) return;
    
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      // Easing function (easeOutQuad)
      const easedProgress = progress * (2 - progress);
      const currentVal = easedProgress * end;
      
      setCount(currentVal);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [end, duration, inView]);

  return (
    <span ref={ref} className="font-mono">
      {prefix}
      {count.toFixed(decimals)}
      {suffix}
    </span>
  );
}
export default CountUp;
