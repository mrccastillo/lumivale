"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { useRef } from "react";

type ParallaxProps = HTMLMotionProps<"div"> & {
  children: ReactNode;
  offset?: number;
  opacityRange?: [number, number];
};

export function Parallax({
  children,
  className,
  offset = 24,
  opacityRange = [0.92, 1],
  style,
  ...props
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [offset, -offset]);
  const opacity = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [1, 1] : opacityRange,
  );

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ ...style, y, opacity }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
