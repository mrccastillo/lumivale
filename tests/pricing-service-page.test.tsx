import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { getAllServices, getServiceBySlug } from "@/lib/services";

const hasTrustedClientAccessMock = vi.hoisted(() => vi.fn());
const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);

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

afterEach(() => {
  hasTrustedClientAccessMock.mockReset();
  notFoundMock.mockClear();
  vi.resetModules();
});

describe("private pricing service page", () => {
  test("generates params for every private pricing service route", async () => {
    const { generateStaticParams } = await import("@/app/pricing/[slug]/page");

    expect(await generateStaticParams()).toEqual(
      getAllServices().map((service) => ({ slug: service.slug })),
    );
  });

  test("renders the trusted private service details, rates, and example section", async () => {
    hasTrustedClientAccessMock.mockResolvedValue(true);
    const { default: PrivatePricingServicePage } = await import("@/app/pricing/[slug]/page");
    const service = getServiceBySlug("comment-campaign");

    if (!service) {
      throw new Error("Expected seeded comment campaign service");
    }

    const { container } = render(
      await PrivatePricingServicePage({
        params: Promise.resolve({ slug: service.slug }),
      }),
    );

    expect(screen.getByRole("heading", { level: 1, name: service.title })).toBeInTheDocument();
    expect(screen.getByText(service.privateContent.heroDescription)).toBeInTheDocument();
    service.privateContent.pricingLines.forEach((line) => {
      expect(screen.getByText(`${line.label}:`, { exact: false })).toBeInTheDocument();
      expect(screen.getAllByText(line.value).length).toBeGreaterThan(0);
    });
    expect(screen.getByText("EXAMPLES")).toBeInTheDocument();
    expect(screen.getAllByText(service.privateContent.examplePlatform).length).toBeGreaterThan(0);
    service.privateContent.exampleCards.forEach((card) => {
      expect(screen.getByRole("heading", { level: 2, name: card.title })).toBeInTheDocument();
      expect(screen.getByText(card.summary)).toBeInTheDocument();
    });

    const serviceNav = screen.getByRole("navigation", { name: "Lumivale Services" });
    const serviceLinks = within(serviceNav).getAllByRole("link");

    expect(serviceLinks).toHaveLength(getAllServices().length);
    expect(within(serviceNav).getByRole("link", { name: service.title })).toHaveAttribute(
      "href",
      `/pricing/${service.slug}`,
    );
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/pricing");
    expect(container.querySelector("[data-nav-surface='dark']")).toBeTruthy();
    expect(container.querySelector("[data-nav-surface='light']")).toBeTruthy();
  });

  test("blocks untrusted visitors from the private pricing service page", async () => {
    hasTrustedClientAccessMock.mockResolvedValue(false);
    const { default: PrivatePricingServicePage } = await import("@/app/pricing/[slug]/page");

    await expect(
      PrivatePricingServicePage({
        params: Promise.resolve({ slug: "comment-campaign" }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });

  test("rejects unknown private pricing slugs", async () => {
    hasTrustedClientAccessMock.mockResolvedValue(true);
    const { default: PrivatePricingServicePage } = await import("@/app/pricing/[slug]/page");

    await expect(
      PrivatePricingServicePage({
        params: Promise.resolve({ slug: "missing-service" }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });
});
