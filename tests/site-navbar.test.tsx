import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

const hasTrustedClientAccessMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/trusted-client", () => ({
  hasTrustedClientAccess: hasTrustedClientAccessMock,
}));

afterEach(() => {
  document.querySelectorAll("[data-nav-surface]").forEach((element) => {
    element.remove();
  });
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    value: 0,
  });
});

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

  test("renders the dark navbar as transparent so it blends into dark heroes", async () => {
    hasTrustedClientAccessMock.mockResolvedValue(false);
    const { SiteNavbar } = await import("@/components/site-navbar");

    const { container } = render(await SiteNavbar());
    const header = container.querySelector("header");

    expect(header).toHaveClass("bg-transparent");
    expect(header).toHaveClass("border-transparent");
  });

  test("renders dark scrolled sections with a glass background and bottom border", async () => {
    hasTrustedClientAccessMock.mockResolvedValue(false);
    const { SiteNavbar } = await import("@/components/site-navbar");

    const { container } = render(await SiteNavbar());
    const header = container.querySelector("header");

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 24,
    });
    fireEvent.scroll(window);

    await waitFor(() => {
      expect(header).toHaveClass("bg-[#031410]/68");
      expect(header).toHaveClass("backdrop-blur-xl");
      expect(header).toHaveClass("border-white/10");
    });
  });

  test("keeps the solid white navbar treatment over light sections", async () => {
    hasTrustedClientAccessMock.mockResolvedValue(false);
    const { SiteNavbar } = await import("@/components/site-navbar");

    const lightSurface = document.createElement("section");
    lightSurface.dataset.navSurface = "light";
    vi.spyOn(lightSurface, "getBoundingClientRect").mockReturnValue({
      top: 0,
      bottom: 120,
      left: 0,
      right: 100,
      width: 100,
      height: 120,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    document.body.appendChild(lightSurface);

    const { container } = render(await SiteNavbar());
    const header = container.querySelector("header");

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 24,
    });
    fireEvent.scroll(window);

    await waitFor(() => {
      expect(header).toHaveClass("bg-white");
      expect(header).toHaveClass("border-[var(--lumivale-line)]");
      expect(header).not.toHaveClass("backdrop-blur-xl");
    });
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
