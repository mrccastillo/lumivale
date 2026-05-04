# Homepage Scroll Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add subtle, premium scroll-linked motion across the homepage with `framer-motion` while preserving the current content structure and marquee behavior.

**Architecture:** Keep `app/page.tsx` server-rendered and wrap existing homepage blocks with small client components for reveal, stagger, and parallax behavior. Use `framer-motion` for scroll transforms and in-view entrance animation, with reduced-motion fallbacks and restrained motion ranges on mobile and desktop.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS v4, framer-motion, Vitest, Testing Library

---

### Task 1: Install motion dependency and lock in homepage motion structure with tests

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `tests/home-page.test.tsx`
- Test: `tests/home-page.test.tsx`

- [ ] **Step 1: Add failing tests for motion wrappers**

```tsx
  test("renders homepage sections inside motion wrappers", async () => {
    const { container } = render(await Home());

    expect(container.querySelector("[data-testid='hero-parallax']")).toBeInTheDocument();
    expect(container.querySelector("[data-testid='proof-reveal']")).toBeInTheDocument();
    expect(container.querySelector("[data-testid='services-group']")).toBeInTheDocument();
    expect(container.querySelector("[data-testid='case-studies-group']")).toBeInTheDocument();
    expect(container.querySelector("[data-testid='testimonials-reveal']")).toBeInTheDocument();
    expect(container.querySelector("[data-testid='faqs-reveal']")).toBeInTheDocument();
    expect(container.querySelector("[data-testid='conversion-reveal']")).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run the homepage test to verify it fails**

Run: `npm test -- tests/home-page.test.tsx`
Expected: FAIL because the homepage does not yet render any of the motion wrapper test ids.

- [ ] **Step 3: Install `framer-motion`**

Run: `npm install framer-motion`
Expected: `package.json` and `package-lock.json` update to include `framer-motion`.

- [ ] **Step 4: Re-run the homepage test if needed**

Run: `npm test -- tests/home-page.test.tsx`
Expected: Still FAIL for missing motion wrappers, not dependency resolution issues.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json tests/home-page.test.tsx
git commit -m "test: cover homepage scroll motion structure"
```

### Task 2: Create reusable motion primitives

**Files:**
- Create: `components/reveal.tsx`
- Create: `components/motion-group.tsx`
- Create: `components/parallax.tsx`
- Test: `tests/home-page.test.tsx`

- [ ] **Step 1: Create `components/reveal.tsx`**

```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type RevealProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
  "data-testid"?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function Reveal<T extends ElementType = "div">({
  as,
  children,
  className,
  delay = 0,
  distance = 24,
  ...props
}: RevealProps<T>) {
  const reduceMotion = useReducedMotion();
  const Component = (as ?? "div") as ElementType;

  return (
    <motion.div
      as={Component}
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: distance }}
      whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Create `components/motion-group.tsx`**

```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { HTMLAttributes, ReactNode } from "react";

type MotionGroupProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  delay?: number;
  stagger?: number;
};

export function MotionGroup({
  children,
  className,
  delay = 0,
  stagger = 0.08,
  ...props
}: MotionGroupProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? "visible" : "visible"}
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren: delay,
            staggerChildren: reduceMotion ? 0 : stagger,
          },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionItem({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={
        reduceMotion
          ? { hidden: {}, visible: {} }
          : {
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
              },
            }
      }
      {...props}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 3: Create `components/parallax.tsx`**

```tsx
"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { HTMLAttributes, ReactNode } from "react";
import { useRef } from "react";

type ParallaxProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  offset?: number;
  range?: [number, number];
};

export function Parallax({
  children,
  className,
  offset = 24,
  range = [0, 1],
  ...props
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, range, reduceMotion ? [0, 0] : [offset, -offset]);
  const opacity = useTransform(scrollYProgress, range, reduceMotion ? [1, 1] : [0.92, 1]);

  return (
    <motion.div ref={ref} className={className} style={{ y, opacity }} {...props}>
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 4: Run the homepage test to verify it still fails only on missing usage**

Run: `npm test -- tests/home-page.test.tsx`
Expected: FAIL because the wrappers exist but `app/page.tsx` does not use them yet.

- [ ] **Step 5: Commit**

```bash
git add components/reveal.tsx components/motion-group.tsx components/parallax.tsx
git commit -m "feat: add homepage motion primitives"
```

### Task 3: Apply motion wrappers across homepage sections

**Files:**
- Modify: `app/page.tsx`
- Test: `tests/home-page.test.tsx`

- [ ] **Step 1: Import the motion primitives**

```tsx
import { MotionGroup, MotionItem } from "@/components/motion-group";
import { Parallax } from "@/components/parallax";
import { Reveal } from "@/components/reveal";
```

- [ ] **Step 2: Wrap the hero content and marquee**

```tsx
          <Parallax
            data-testid="hero-parallax"
            className="mx-auto flex min-h-[52vh] max-w-7xl flex-col items-center justify-center text-center sm:min-h-[56vh]"
            offset={18}
          >
```

```tsx
            <Parallax data-testid="hero-marquee-parallax" offset={12} className="w-full">
              <div
                data-testid="platform-row"
                className="lumivale-marquee-fade mt-8 w-full max-w-4xl overflow-hidden sm:mt-10"
              >
```

- [ ] **Step 3: Wrap the proof and services sections**

```tsx
          <Reveal data-testid="proof-reveal" className="mx-auto max-w-7xl text-center">
```

```tsx
            <MotionGroup
              data-testid="services-group"
              className="mt-10 grid gap-5 sm:mt-14 md:grid-cols-2 xl:grid-cols-3"
            >
```

```tsx
              <MotionItem key={service.slug}>
                <article className="flex min-h-[220px] flex-col rounded-lg border border-[var(--lumivale-line)] bg-[#fbfcff] p-6 shadow-[0_20px_60px_rgba(42,47,82,0.06)] transition hover:-translate-y-1 hover:border-[var(--lumivale-accent)] hover:shadow-[0_24px_70px_rgba(42,47,82,0.1)] sm:p-7">
```

- [ ] **Step 4: Wrap the remaining sections**

```tsx
          <MotionGroup data-testid="case-studies-group" className="mt-10 sm:mt-14">
            <MotionItem>
              <CaseStudyCards caseStudies={caseStudies} />
            </MotionItem>
          </MotionGroup>
```

```tsx
        <Reveal data-testid="testimonials-reveal" className="mx-auto max-w-6xl">
```

```tsx
        <Reveal data-testid="faqs-reveal" className="mx-auto grid max-w-7xl gap-10 sm:gap-12 lg:grid-cols-[0.74fr_1.26fr] lg:gap-20">
```

```tsx
        <Reveal data-testid="conversion-reveal" className="mx-auto max-w-4xl text-center">
```

- [ ] **Step 5: Run the homepage test to verify it passes**

Run: `npm test -- tests/home-page.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx tests/home-page.test.tsx
git commit -m "feat: add homepage scroll motion"
```

### Task 4: Verify homepage motion integration

**Files:**
- Test: `tests/home-page.test.tsx`
- Test: `package.json`
- Test: `app/page.tsx`

- [ ] **Step 1: Run the focused homepage suite**

Run: `npm test -- tests/home-page.test.tsx`
Expected: PASS

- [ ] **Step 2: Run the production build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Review the final diff for scope**

```bash
git diff -- app/page.tsx components/reveal.tsx components/motion-group.tsx components/parallax.tsx tests/home-page.test.tsx package.json package-lock.json
```

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx components/reveal.tsx components/motion-group.tsx components/parallax.tsx tests/home-page.test.tsx package.json package-lock.json docs/superpowers/plans/2026-05-04-homepage-scroll-motion-implementation.md
git commit -m "chore: add homepage scroll motion plan"
```
