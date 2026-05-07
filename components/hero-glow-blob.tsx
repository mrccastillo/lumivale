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
        x: [-132, 68, 152, -48, -132],
        y: [0, 56, -46, 30, 0],
        scale: [0.86, 1.06, 1.2, 1.01, 0.86],
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
        x: [92, -82, -26, 108, 92],
        y: [24, 66, -34, 36, 24],
        scale: [0.84, 1.2, 1.08, 0.97, 0.84],
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
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="absolute inset-0 blur-[100px] bg-[radial-gradient(circle_at_50%_52%,rgba(64,214,146,0.56)_0%,rgba(31,148,101,0.42)_28%,rgba(12,60,40,0.22)_56%,transparent_78%)]" />
      </motion.div>

      <motion.div
        className="absolute top-[3.5rem] h-[19rem] w-[48rem] max-w-[110vw] sm:top-[4rem] sm:h-[23rem] sm:w-[58rem]"
        initial={false}
        animate={secondaryAnimate}
        transition={{
          duration: 6.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="absolute inset-0 blur-[84px] bg-[radial-gradient(circle_at_48%_50%,rgba(184,255,225,0.3)_0%,rgba(79,209,149,0.2)_42%,transparent_76%)]" />
      </motion.div>
    </div>
  );
}
