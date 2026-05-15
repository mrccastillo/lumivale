"use client";

import { motion, useReducedMotion } from "framer-motion";

import type { HeroClientInput } from "@/lib/hero-clients";

const trackCopies = 2;
const minimumLogosPerSequence = 32;
const marqueeDuration = 157.95;

type HeroClientMarqueeProps = {
  clients: HeroClientInput[];
};

export function HeroClientMarquee({ clients }: HeroClientMarqueeProps) {
  const reduceMotion = useReducedMotion();
  const sequenceRepeats = Math.max(
    1,
    Math.ceil(minimumLogosPerSequence / Math.max(clients.length, 1)),
  );

  return (
    <div
      data-testid="platform-row"
      className="lumivale-marquee-fade mt-8 w-[calc(100%+2rem)] -translate-x-4 overflow-hidden sm:mt-9 sm:w-[calc(100%+3rem)] sm:-translate-x-6"
    >
      <motion.div
        data-testid="platform-track"
        className="lumivale-marquee-track flex w-max items-center"
        animate={reduceMotion ? { x: 0 } : { x: ["0%", "-50%"] }}
        transition={{
          duration: marqueeDuration,
          ease: "linear",
          repeat: reduceMotion ? 0 : Infinity,
          repeatType: "loop",
        }}
      >
        {Array.from({ length: trackCopies }, (_, copyIndex) => (
          <div
            key={`sequence-${copyIndex}`}
            data-testid="platform-sequence"
            aria-hidden={copyIndex > 0 || undefined}
            className="flex shrink-0 items-center gap-x-8 pr-8 text-sm font-semibold text-[#b8f6d9] sm:gap-x-16 sm:pr-16 sm:text-xl"
          >
            {Array.from(
              { length: sequenceRepeats },
              (_, repeatIndex) => (
                <div
                  key={`sequence-${copyIndex}-repeat-${repeatIndex}`}
                  aria-hidden={
                    copyIndex > 0 || repeatIndex > 0 || undefined
                  }
                  className="flex shrink-0 items-center gap-x-8 sm:gap-x-16"
                >
                  {clients.map((client) => (
                    <span
                      key={`sequence-${copyIndex}-${repeatIndex}-${client.clientName}`}
                      data-testid="platform-item"
                      className="inline-flex min-h-10 min-w-[4.25rem] items-center justify-center whitespace-nowrap"
                    >
                      {client.logoUrl ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={client.logoUrl}
                            alt={`${client.clientName} logo`}
                            className="max-h-9 max-w-[10rem] rounded-[2px] object-contain opacity-95"
                          />
                          <span className="sr-only">{client.clientName}</span>
                        </>
                      ) : (
                        client.clientName
                      )}
                    </span>
                  ))}
                </div>
              ),
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
