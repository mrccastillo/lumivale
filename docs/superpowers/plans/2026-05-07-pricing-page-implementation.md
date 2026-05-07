# Pricing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the skeletal private pricing page with a clean service-by-service pricing list that uses existing service summaries and placeholder `Starting at $X/mo` labels while preserving trusted-client access control.

**Architecture:** Keep the pricing page as a single server component in `app/pricing/page.tsx` and reuse `getAllServices()` from `lib/services.ts` so service names and descriptions stay aligned with the rest of the site. Add a local placeholder-price map in the route, render one bordered pricing panel with stacked service rows, and expand the page test to cover both trusted rendering and denied access through `notFound()`.

**Tech Stack:** Next.js App Router, React server components, TypeScript, Tailwind CSS, Vitest, Testing Library

---

## File Structure

- `app/pricing/page.tsx`
  - Keep the existing trusted-client gate.
  - Import the shared services catalog.
  - Define placeholder monthly starting prices keyed by service slug.
  - Render the approved design: restrained header, one pricing panel, five service rows, and a plain closing note.
- `tests/pricing-page.test.tsx`
  - Mock `hasTrustedClientAccess`.
  - Mock `notFound()` from `next/navigation` so denied access can be asserted directly.
  - Verify trusted visitors see the service list, placeholder pricing labels, and existing spacing contract.
  - Verify untrusted visitors trigger `notFound()` and do not render pricing content.

### Task 1: Expand Pricing Page Test Coverage First

**Files:**
- Modify: `tests/pricing-page.test.tsx`
- Test: `tests/pricing-page.test.tsx`

- [ ] **Step 1: Replace the current single happy-path test with trusted and denied-access coverage**

Update `tests/pricing-page.test.tsx` to the following so the test suite defines the target behavior before any production code changes:

```tsx
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const hasTrustedClientAccessMock = vi.hoisted(() => vi.fn());
const notFoundMock = vi.hoisted(() => vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
}));

vi.mock("@/lib/trusted-client", () => ({
  hasTrustedClientAccess: hasTrustedClientAccessMock,
}));

vi.mock("next/navigation", async () => {
  const actual = await vi.importActual<typeof import("next/navigation")>("next/navigation");

  return {
    ...actual,
    notFound: notFoundMock,
  };
});

describe("pricing page", () => {
  beforeEach(() => {
    hasTrustedClientAccessMock.mockReset();
    notFoundMock.mockClear();
  });

  test("renders service-by-service placeholder pricing for trusted visitors", async () => {
    hasTrustedClientAccessMock.mockResolvedValue(true);
    const { default: PricingPage } = await import("@/app/pricing/page");

    const { container } = render(await PricingPage());

    expect(screen.getByRole("heading", { name: "Pricing", level: 1 })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Private flat-rate growth packages for approved Lumivale clients.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Simple monthly pricing for focused growth support."),
    ).toBeInTheDocument();
    expect(screen.getByText("Comment Campaign")).toBeInTheDocument();
    expect(screen.getByText("UGC Content Creation")).toBeInTheDocument();
    expect(screen.getByText("Creator Collabs")).toBeInTheDocument();
    expect(screen.getByText("LinkedIn Outreaching")).toBeInTheDocument();
    expect(screen.getByText("Email B2B Campaigns")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Join relevant Reddit, Quora, and X conversations to increase awareness and send more interested users back to your site.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Publish consistent short-form videos on YouTube Shorts and TikTok through brand-specific content accounts.",
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Starting at \\$X\\/mo/)).toHaveLength(5);
    expect(
      screen.getByText(
        "Custom scopes and bundled support can be shaped after an initial call.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Placeholder/i)).not.toBeInTheDocument();
    expect(container.querySelector("section")).toHaveClass("pt-32", "pb-[54px]");
    expect(container.querySelector("section")).not.toHaveClass("py-[54px]");
  });

  test("blocks untrusted visitors with notFound", async () => {
    hasTrustedClientAccessMock.mockResolvedValue(false);
    const { default: PricingPage } = await import("@/app/pricing/page");

    await expect(PricingPage()).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run the pricing page test file to verify it fails for the expected reason**

Run: `npm test -- tests/pricing-page.test.tsx`

Expected: `FAIL` because the current page does not render the service rows, the supporting line, or the closing note yet.

- [ ] **Step 3: Commit the failing-test checkpoint**

```bash
git add tests/pricing-page.test.tsx
git commit -m "test: cover pricing service list layout"
```

### Task 2: Implement The Pricing Page Layout

**Files:**
- Modify: `app/pricing/page.tsx`
- Test: `tests/pricing-page.test.tsx`

- [ ] **Step 1: Import the shared services catalog and define the local placeholder pricing data**

At the top of `app/pricing/page.tsx`, add `getAllServices()` and a local slug-to-price-label map so the route can render shared service copy with consistent placeholder pricing:

```tsx
import { notFound } from "next/navigation";

import { getAllServices } from "@/lib/services";
import { hasTrustedClientAccess } from "@/lib/trusted-client";

const pricingStartsBySlug: Record<string, string> = {
  "comment-campaign": "Starting at $X/mo",
  "ugc-content-creation": "Starting at $X/mo",
  "creator-collabs": "Starting at $X/mo",
  "linkedin-outreaching": "Starting at $X/mo",
  "email-b2b-campaigns": "Starting at $X/mo",
};

const pricingSupportLine = "Simple monthly pricing for focused growth support.";
const pricingClosingNote =
  "Custom scopes and bundled support can be shaped after an initial call.";
```

- [ ] **Step 2: Replace the sparse page body with the approved header, single panel, and service rows**

Use the shared services array to render the pricing list while preserving the trusted-client gate and the existing section spacing contract:

```tsx
export default async function PricingPage() {
  const hasTrustedAccess = await hasTrustedClientAccess();

  if (!hasTrustedAccess) {
    notFound();
  }

  const services = getAllServices();

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 pb-[54px] pt-32">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-medium text-stone-900">Pricing</h1>
        <p className="mt-4 max-w-2xl text-stone-600">
          Private flat-rate growth packages for approved Lumivale clients.
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--lumivale-muted)] sm:text-base">
          {pricingSupportLine}
        </p>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-[var(--lumivale-line)] bg-white shadow-[0_20px_60px_rgba(42,47,82,0.06)]">
        {services.map((service, index) => (
          <article
            key={service.slug}
            className={[
              "flex flex-col gap-4 px-6 py-6 sm:px-8 sm:py-7 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-8",
              index < services.length - 1 ? "border-b border-[var(--lumivale-line)]" : "",
            ].join(" ")}
          >
            <div>
              <h2 className="text-lg font-semibold text-[var(--lumivale-ink)] sm:text-xl">
                {service.title}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--lumivale-muted)] sm:text-base">
                {service.summary}
              </p>
            </div>

            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--lumivale-accent)] lg:pt-1">
              {pricingStartsBySlug[service.slug]}
            </p>
          </article>
        ))}
      </div>

      <p className="max-w-2xl text-sm leading-7 text-[var(--lumivale-muted)]">
        {pricingClosingNote}
      </p>
    </section>
  );
}
```

- [ ] **Step 3: Run the pricing page tests to verify the new layout passes**

Run: `npm test -- tests/pricing-page.test.tsx`

Expected: `PASS`

- [ ] **Step 4: Commit the pricing page implementation**

```bash
git add app/pricing/page.tsx tests/pricing-page.test.tsx
git commit -m "feat: add service-by-service pricing page"
```

### Task 3: Verify The Shared Surface

**Files:**
- Verify only

- [ ] **Step 1: Run the focused pricing and service tests**

Run: `npm test -- tests/pricing-page.test.tsx tests/services.test.tsx`

Expected: `PASS`

- [ ] **Step 2: Run the full test suite**

Run: `npm test`

Expected: `PASS`

- [ ] **Step 3: Run lint**

Run: `npm run lint`

Expected: `PASS`

- [ ] **Step 4: Review the final diff**

Run: `git diff -- app/pricing/page.tsx tests/pricing-page.test.tsx`

Expected: only the pricing route layout and pricing page test updates are present.
