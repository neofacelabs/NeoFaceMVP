"use client";

import React, { useRef, useEffect, useState, useLayoutEffect } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";

interface ScrollSequenceProps {
  folderPath: string;
  frameCount: number;
  sectionRef: React.RefObject<HTMLElement | null>;
  opacity?: number;
  overlayOpacity?: number;
}

export function ScrollSequence({
  folderPath,
  frameCount,
  sectionRef,
  opacity = 0.25,
  overlayOpacity = 0.65
}: ScrollSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadedProgress, setLoadedProgress] = useState(0);

  // Scroll progress for the fade-in/fade-out visibility
  const { scrollYProgress: visibilityProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Scroll progress for the fast frame scrubbing
  const { scrollYProgress: scrubbingProgress } = useScroll({
    target: sectionRef,
    offset: ["start 80%", "end 20%"]
  });

  // Map scrubbing progress to frame index
  const frameIndex = useTransform(scrubbingProgress, [0, 1], [1, frameCount]);

  // Map visibility progress to background canvas opacity
  const bgOpacity = useTransform(
    visibilityProgress,
    [0, 0.1, 0.9, 1],
    [0, opacity, opacity, 0]
  );

  // Preload all frames into memory
  useLayoutEffect(() => {
    let active = true;
    let loadedCount = 0;
    const images: HTMLImageElement[] = [];

    const handleImageLoad = () => {
      if (!active) return;
      loadedCount++;
      setLoadedProgress(Math.round((loadedCount / frameCount) * 100));
      if (loadedCount === frameCount) {
        setLoaded(true);
      }
    };

    const handleImageError = (e: Event | string) => {
      // In case frame fails to load, count it anyway to resolve loader state
      handleImageLoad();
    };

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      const paddedIndex = String(i).padStart(3, "0");
      img.src = `${folderPath}/ezgif-frame-${paddedIndex}.jpg`;
      img.onload = handleImageLoad;
      img.onerror = handleImageError;
      images.push(img);
    }
    
    imagesRef.current = images;

    return () => {
      active = false;
    };
  }, [folderPath, frameCount]);

  // Render a specific frame on canvas
  const drawFrame = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imagesRef.current[index - 1];
    if (!img || !img.complete) return;

    // Clear previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const imgWidth = img.width;
    const imgHeight = img.height;

    const imgRatio = imgWidth / imgHeight;
    const canvasRatio = canvasWidth / canvasHeight;

    let drawWidth = canvasWidth;
    let drawHeight = canvasHeight;
    let drawX = 0;
    let drawY = 0;

    // Aspect ratio fit (Cover mode)
    if (canvasRatio > imgRatio) {
      drawHeight = canvasWidth / imgRatio;
      drawY = (canvasHeight - drawHeight) / 2;
    } else {
      drawWidth = canvasHeight * imgRatio;
      drawX = (canvasWidth - drawWidth) / 2;
    }

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  };

  // Redraw canvas on frame index change
  useMotionValueEvent(frameIndex, "change", (latest) => {
    if (!loaded) return;
    const roundedIndex = Math.min(frameCount, Math.max(1, Math.round(latest)));
    requestAnimationFrame(() => drawFrame(roundedIndex));
  });

  // Handle canvas sizing and redraws on resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Draw active scroll-mapped frame immediately
      if (loaded) {
        const currentProgress = scrubbingProgress.get();
        const currentIndex = Math.min(
          frameCount,
          Math.max(1, Math.round(currentProgress * (frameCount - 1) + 1))
        );
        drawFrame(currentIndex);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    resizeCanvas();

    return () => {
      resizeObserver.disconnect();
    };
  }, [loaded, scrubbingProgress, frameCount]);

  return (
    <motion.div 
      className="fixed inset-0 z-[-10] pointer-events-none overflow-hidden"
      style={{ opacity: bgOpacity }}
    >
      <div className="w-full h-full relative">
        {/* Heavy Black Backdrop overlay to prevent high brightness and secure text readability */}
        <div 
          className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-500 bg-black"
          style={{ opacity: overlayOpacity }}
        />
        
        {/* HTML5 canvas wrapper */}
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover transition-opacity duration-700"
          style={{ opacity: loaded ? 1 : 0 }}
        />

        {/* Subtle frame preloading visual marker */}
        {!loaded && (
          <div className="absolute bottom-4 right-4 z-20 font-mono text-[9px] text-white/20 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            PRELOADING SEQUENCE: {loadedProgress}%
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default ScrollSequence;
