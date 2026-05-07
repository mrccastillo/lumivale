import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { getAllServices } from "@/lib/services";

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

afterEach(() => {
  hasTrustedClientAccessMock.mockReset();
  notFoundMock.mockClear();
  vi.resetModules();
});

describe("pricing page", () => {
  test("renders pricing rows and service detail links for trusted visitors", async () => {
    hasTrustedClientAccessMock.mockResolvedValue(true);
    const { default: PricingPage } = await import("@/app/pricing/page");
    const services = getAllServices();

    const { container } = render(await PricingPage());

    expect(screen.getByRole("heading", { name: "Pricing", level: 1 })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Simple monthly pricing for focused growth support across Lumivale's core service channels.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Current private monthly rates for approved client discussions."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Private access/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Private flat-rate/i)).not.toBeInTheDocument();
    services.forEach((service) => {
      expect(screen.getByRole("heading", { name: service.title, level: 2 })).toBeInTheDocument();
      expect(screen.getByText(service.summary)).toBeInTheDocument();
    });
    expect(screen.getAllByText("Starting at $850/mo")).toHaveLength(2);
    expect(screen.getByText("$850/mo + creator fees")).toBeInTheDocument();
    expect(screen.getByText("$850/mo")).toBeInTheDocument();
    expect(screen.getByText("$1000/mo")).toBeInTheDocument();
    const viewMoreLinks = screen.getAllByRole("link", { name: "View more" });

    expect(viewMoreLinks).toHaveLength(services.length);
    viewMoreLinks.forEach((link, index) => {
      expect(link).toHaveAttribute("href", `/pricing/${services[index]?.slug}`);
    });
    expect(screen.queryByText(/Placeholder/i)).not.toBeInTheDocument();
    expect(container.querySelector("section")).toHaveClass("pt-32", "pb-[54px]");
    expect(container.querySelector("section")).not.toHaveClass("py-[54px]");
  });

  test("blocks public visitors with notFound", async () => {
    hasTrustedClientAccessMock.mockResolvedValue(false);
    const { default: PricingPage } = await import("@/app/pricing/page");

    await expect(PricingPage()).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });
});
