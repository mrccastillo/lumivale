"use client";

import { useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";

type TestimonialsSpotlightProps = {
  children?: ReactNode;
  className?: string;
};

export function TestimonialsSpotlight({
  children,
  className = "",
}: TestimonialsSpotlightProps) {
  const [spotlight, setSpotlight] = useState({ active: false, x: "50%", y: "30%" });

  const cursorGlowStyle: CSSProperties = {
    background: `radial-gradient(560px circle at ${spotlight.x} ${spotlight.y}, rgba(115,220,174,${
      spotlight.active ? "0.12" : "0.05"
    }), transparent 72%)`,
  };

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = `${event.clientX - rect.left}px`;
    const y = `${event.clientY - rect.top}px`;

    setSpotlight({ active: true, x, y });
  }

  function handlePointerLeave() {
    setSpotlight((current) => ({ ...current, active: false }));
  }

  return (
    <div
      data-testid="testimonials-spotlight"
      className={`relative h-full w-full overflow-hidden ${className}`}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 transition-opacity duration-300 motion-reduce:transition-none ${
          spotlight.active ? "opacity-100" : "opacity-85"
        }`}
      >
        <div className="absolute inset-0" style={cursorGlowStyle} />
      </div>
      {children ? <div className="relative z-10">{children}</div> : null}
    </div>
  );
}
