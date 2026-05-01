import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

const hasTrustedClientAccessMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/trusted-client", () => ({
  hasTrustedClientAccess: hasTrustedClientAccessMock,
}));

describe("site navbar", () => {
  test("shows blogs and contact us for public visitors without case studies", async () => {
    hasTrustedClientAccessMock.mockResolvedValue(false);
    const { SiteNavbar } = await import("@/components/site-navbar");

    render(await SiteNavbar());

    expect(screen.getByRole("link", { name: "Blogs" })).toHaveAttribute(
      "href",
      "/blogs",
    );
    expect(
      screen.queryByRole("link", { name: "Case Studies" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact Us" })).toHaveAttribute(
      "href",
      "https://calendly.com/lumivale/discovery-call",
    );
    expect(screen.getByRole("link", { name: "Contact Us" })).toHaveAttribute(
      "target",
      "_blank",
    );
    expect(screen.getByRole("link", { name: "Contact Us" })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
  });

  test("hides the pricing link for public visitors", async () => {
    hasTrustedClientAccessMock.mockResolvedValue(false);
    const { SiteNavbar } = await import("@/components/site-navbar");

    render(await SiteNavbar());

    expect(screen.queryByRole("link", { name: "Pricing" })).not.toBeInTheDocument();
  });

  test("shows the pricing link for trusted visitors", async () => {
    hasTrustedClientAccessMock.mockResolvedValue(true);
    const { SiteNavbar } = await import("@/components/site-navbar");

    render(await SiteNavbar());

    expect(screen.getByRole("link", { name: "Pricing" })).toHaveAttribute(
      "href",
      "/pricing",
    );
  });
});
