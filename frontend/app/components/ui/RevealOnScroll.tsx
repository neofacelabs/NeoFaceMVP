"use client";

import React from "react";
import { motion } from "framer-motion";

interface RevealOnScrollProps {
  children: React.ReactNode;
  delay?: number;
  yOffset?: number;
  staggerChildren?: number;
  className?: string;
}

export function RevealOnScroll({
  children,
  delay = 0,
  yOffset = 40,
  staggerChildren = 0.08,
  className = ""
}: RevealOnScrollProps) {
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerChildren,
        delayChildren: delay
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: yOffset,
      filter: "blur(6px)"
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { 
        duration: 0.7, 
        ease: [0.16, 1, 0.3, 1] as any // Expo-out curve
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: "-60px" }}
      variants={containerVariants}
      className={className}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        
        // Wrap direct child in a motion tag
        return (
          <motion.div variants={itemVariants}>
            {child}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
export default RevealOnScroll;
