import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import styles from "@/components/site-navbar.module.css";

import { CALENDLY_URL } from "@/lib/site-config";

vi.mock("@/lib/site-content", () => ({
  getSiteContentForSite: vi.fn(async () => (await import("@/lib/site-content-defaults")).defaultSiteContent),
}));

const hasTrustedClientAccessMock = vi.hoisted(() => vi.fn());
const pathnameMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/trusted-client", () => ({
  hasTrustedClientAccess: hasTrustedClientAccessMock,
}));

vi.mock("next/navigation", async () => {
  const actual = await vi.importActual<typeof import("next/navigation")>("next/navigation");

  return {
    ...actual,
    usePathname: pathnameMock,
  };
});

afterEach(() => {
  document.querySelectorAll("[data-nav-surface]").forEach((element) => {
    element.remove();
  });
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    value: 0,
  });
  pathnameMock.mockReset();
});

describe("site navbar", () => {
  test("shows public navigation anchors and contact us for public visitors", async () => {
    hasTrustedClientAccessMock.mockResolvedValue(false);
    pathnameMock.mockReturnValue("/");
    const { SiteNavbar } = await import("@/components/site-navbar");

    render(await SiteNavbar());

    expect(screen.getByRole("link", { name: "Services" })).toHaveAttribute(
      "href",
      "/#services",
    );
    expect(screen.getByRole("link", { name: "Case Studies" })).toHaveAttribute(
      "href",
      "/#case-studies",
    );
    expect(screen.getByRole("link", { name: "Testimonials" })).toHaveAttribute(
      "href",
      "/#testimonials",
    );
    expect(screen.getByRole("link", { name: "About Us" })).toHaveAttribute(
      "href",
      "/about",
    );
    expect(screen.queryByRole("link", { name: "About" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Blogs" })).toHaveAttribute(
      "href",
      "/blogs",
    );
    expect(screen.getByRole("link", { name: "Contact Us" })).toHaveAttribute(
      "href",
      CALENDLY_URL,
    );
    expect(screen.getByRole("link", { name: "Contact Us" })).toHaveAttribute(
      "target",
      "_blank",
    );
    expect(screen.getByRole("link", { name: "Contact Us" })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
    expect(screen.getByRole("link", { name: "Contact Us" })).toHaveClass(
      styles.desktopCta,
    );
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveClass(
      styles.menuButton,
    );
  });

  test("tracks the visible homepage section in both menus and includes FAQ", async () => {
    hasTrustedClientAccessMock.mockResolvedValue(false);
    pathnameMock.mockReturnValue("/");
    const { SiteNavbar } = await import("@/components/site-navbar");
    const section = document.createElement("section");
    section.id = "services";
    let top = 500;
    vi.spyOn(section, "getBoundingClientRect").mockImplementation(() => ({ top, bottom: top + 600 } as DOMRect));
    document.body.appendChild(section);
    render(await SiteNavbar());
    expect(screen.getByRole("link", { name: "FAQ" })).toHaveAttribute("href", "/#faqs");
    expect(screen.getByRole("link", { name: "Home", exact: true })).toHaveAttribute("aria-current", "page");
    top = 90;
    fireEvent.scroll(window);
    expect(screen.getByRole("link", { name: "Services" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Home", exact: true })).not.toHaveAttribute("aria-current");
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(within(screen.getByRole("navigation", { name: "Mobile" })).getByRole("link", { name: "Services" })).toHaveAttribute("aria-current", "page");
    top = 500;
    fireEvent.scroll(window);
    expect(within(screen.getByRole("navigation", { name: "Primary" })).getByRole("link", { name: "Home", exact: true })).toHaveAttribute("aria-current", "page");
    section.remove();
  });

  test("opens a mobile menu with navigation links and a book a call CTA", async () => {
    hasTrustedClientAccessMock.mockResolvedValue(false);
    pathnameMock.mockReturnValue("/");
    const { SiteNavbar } = await import("@/components/site-navbar");

    render(await SiteNavbar());

    const menuButton = screen.getByRole("button", { name: "Open menu" });

    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("navigation", { name: "Mobile" })).not.toBeInTheDocument();

    fireEvent.click(menuButton);

    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    const mobileNav = screen.getByRole("navigation", { name: "Mobile" });
    expect(within(mobileNav).getByRole("link", { name: "Services" })).toHaveAttribute(
      "href",
      "/#services",
    );
    expect(within(mobileNav).getByRole("link", { name: "Book a call" })).toHaveAttribute(
      "href",
      CALENDLY_URL,
    );
    expect(
      within(mobileNav).getByRole("link", { name: "Book a call" }),
    ).toHaveAttribute("target", "_blank");
  });

  test("closes the mobile menu after route changes", async () => {
    hasTrustedClientAccessMock.mockResolvedValue(false);
    pathnameMock.mockReturnValue("/");
    const { SiteNavbar } = await import("@/components/site-navbar");

    const { rerender } = render(await SiteNavbar());

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("navigation", { name: "Mobile" })).toBeInTheDocument();

    pathnameMock.mockReturnValue("/blogs");
    rerender(await SiteNavbar());

    await waitFor(() => {
      expect(screen.queryByRole("navigation", { name: "Mobile" })).not.toBeInTheDocument();
    });
  });

  test("hides the pricing link for public visitors", async () => {
    hasTrustedClientAccessMock.mockResolvedValue(false);
    pathnameMock.mockReturnValue("/");
    const { SiteNavbar } = await import("@/components/site-navbar");

    render(await SiteNavbar());

    expect(screen.queryByRole("link", { name: "Pricing" })).not.toBeInTheDocument();
  });

  test("renders the dark navbar as transparent so it blends into dark heroes", async () => {
    hasTrustedClientAccessMock.mockResolvedValue(false);
    pathnameMock.mockReturnValue("/");
    const { SiteNavbar } = await import("@/components/site-navbar");

    const { container } = render(await SiteNavbar());
    const header = container.querySelector("header");

    expect(header).toHaveAttribute("data-surface", "dark");
    expect(header).toHaveAttribute("data-scrolled", "false");
  });

  test("renders dark scrolled sections with a glass background and bottom border", async () => {
    hasTrustedClientAccessMock.mockResolvedValue(false);
    pathnameMock.mockReturnValue("/");
    const { SiteNavbar } = await import("@/components/site-navbar");

    const { container } = render(await SiteNavbar());
    const header = container.querySelector("header");

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 24,
    });
    fireEvent.scroll(window);

    await waitFor(() => {
      expect(header).toHaveAttribute("data-surface", "dark");
      expect(header).toHaveAttribute("data-scrolled", "true");
      expect(header).toHaveClass(styles.dark);
    });
  });

  test("uses the ivory navbar treatment over light sections", async () => {
    hasTrustedClientAccessMock.mockResolvedValue(false);
    pathnameMock.mockReturnValue("/blogs");
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
      expect(header).toHaveAttribute("data-surface", "light");
      expect(header).toHaveClass(styles.light);
      expect(header).not.toHaveClass(styles.dark);
    });
  });

  test("shows the pricing link for trusted visitors", async () => {
    hasTrustedClientAccessMock.mockResolvedValue(true);
    pathnameMock.mockReturnValue("/");
    const { SiteNavbar } = await import("@/components/site-navbar");

    render(await SiteNavbar());

    expect(screen.getByRole("link", { name: "Pricing" })).toHaveAttribute(
      "href",
      "/pricing",
    );
  });

  test("includes pricing inside the mobile menu for trusted visitors", async () => {
    hasTrustedClientAccessMock.mockResolvedValue(true);
    pathnameMock.mockReturnValue("/");
    const { SiteNavbar } = await import("@/components/site-navbar");

    render(await SiteNavbar());

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));

    const mobileNav = screen.getByRole("navigation", { name: "Mobile" });
    expect(within(mobileNav).getByRole("link", { name: "Pricing" })).toHaveAttribute(
      "href",
      "/pricing",
    );
  });

  test("keeps pricing active on nested private pricing routes", async () => {
    hasTrustedClientAccessMock.mockResolvedValue(true);
    pathnameMock.mockReturnValue("/pricing/comment-campaign");
    const { SiteNavbar } = await import("@/components/site-navbar");

    render(await SiteNavbar());

    expect(screen.getByRole("link", { name: "Pricing" })).toHaveAttribute("aria-current", "page");
  });

  test("updates navbar surface immediately after route changes without requiring scroll", async () => {
    hasTrustedClientAccessMock.mockResolvedValue(false);
    pathnameMock.mockReturnValue("/");
    const { SiteNavbar } = await import("@/components/site-navbar");

    const homeSurface = document.createElement("section");
    homeSurface.dataset.navSurface = "dark";
    vi.spyOn(homeSurface, "getBoundingClientRect").mockReturnValue({
      top: 0,
      bottom: 140,
      left: 0,
      right: 100,
      width: 100,
      height: 140,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    document.body.appendChild(homeSurface);

    const { container, rerender } = render(await SiteNavbar());
    const header = container.querySelector("header");

    await waitFor(() => {
      expect(header).toHaveAttribute("data-surface", "dark");
    });

    homeSurface.remove();

    const lightSurface = document.createElement("main");
    lightSurface.dataset.navSurface = "light";
    vi.spyOn(lightSurface, "getBoundingClientRect").mockReturnValue({
      top: 0,
      bottom: 180,
      left: 0,
      right: 100,
      width: 100,
      height: 180,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    document.body.appendChild(lightSurface);

    pathnameMock.mockReturnValue("/blogs");
    rerender(await SiteNavbar());

    await waitFor(() => {
      expect(header).toHaveAttribute("data-surface", "light");
      expect(header).toHaveClass(styles.light);
      expect(header).not.toHaveClass(styles.dark);
    });
  });
});
