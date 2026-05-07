"use client";

import { motion, useReducedMotion } from "framer-motion";

export function HeroGlowBlob() {
  const reduceMotion = useReducedMotion();

  const primaryAnimate = reduceMotion
    ? {
        x: 0,
        y: 0,
        scale: 1,
        borderRadius: "46% 54% 58% 42% / 42% 38% 62% 58%",
      }
    : {
        x: [-64, 32, 72, -20, -64],
        y: [0, 26, -24, 14, 0],
        scale: [0.94, 1.03, 1.12, 1.02, 0.94],
        borderRadius: [
          "46% 54% 58% 42% / 42% 38% 62% 58%",
          "58% 42% 44% 56% / 50% 55% 45% 50%",
          "43% 57% 51% 49% / 59% 41% 59% 41%",
          "55% 45% 61% 39% / 44% 56% 44% 56%",
          "46% 54% 58% 42% / 42% 38% 62% 58%",
        ],
      };

  const secondaryAnimate = reduceMotion
    ? {
        x: 0,
        y: 0,
        scale: 1,
        borderRadius: "58% 42% 52% 48% / 45% 56% 44% 55%",
      }
    : {
        x: [42, -38, -10, 48, 42],
        y: [12, 34, -16, 20, 12],
        scale: [0.92, 1.12, 1.04, 0.98, 0.92],
        borderRadius: [
          "58% 42% 52% 48% / 45% 56% 44% 55%",
          "42% 58% 39% 61% / 56% 43% 57% 44%",
          "51% 49% 61% 39% / 37% 63% 37% 63%",
          "61% 39% 47% 53% / 54% 46% 54% 46%",
          "58% 42% 52% 48% / 45% 56% 44% 55%",
        ],
      };

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-[-9rem] z-0 flex justify-center overflow-visible"
    >
      <motion.div
        className="relative h-[27rem] w-[88rem] max-w-[170vw] sm:h-[32rem] sm:w-[98rem]"
        initial={false}
        animate={primaryAnimate}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="absolute inset-0 blur-[96px] bg-[radial-gradient(circle_at_50%_52%,rgba(43,181,121,0.62)_0%,rgba(24,119,80,0.5)_28%,rgba(10,50,34,0.26)_56%,transparent_78%)]" />
      </motion.div>

      <motion.div
        className="absolute top-[3.5rem] h-[19rem] w-[48rem] max-w-[110vw] sm:top-[4rem] sm:h-[23rem] sm:w-[58rem]"
        initial={false}
        animate={secondaryAnimate}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="absolute inset-0 blur-[78px] bg-[radial-gradient(circle_at_48%_50%,rgba(162,255,216,0.34)_0%,rgba(63,189,133,0.24)_42%,transparent_76%)]" />
      </motion.div>
    </div>
  );
}
