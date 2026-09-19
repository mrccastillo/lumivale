import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { SiteFooter } from "@/components/site-footer";
import { defaultSiteContent } from "@/lib/site-content-defaults";
import { getSiteContentForSite } from "@/lib/site-content";

vi.mock("@/lib/site-content", () => ({ getSiteContentForSite: vi.fn() }));
vi.mocked(getSiteContentForSite).mockResolvedValue(defaultSiteContent);

describe("site footer", () => {
  test("renders a dark Lumivale footer with growth copy and contact CTA", async () => {
    const { container } = render(await SiteFooter());

    expect(container.querySelector("footer")).toHaveAttribute("data-theme", "dark");
    expect(screen.getByText("Lumivale")).toBeInTheDocument();
    expect(screen.getByText("Light up your growth.")).toBeInTheDocument();
    expect(screen.getByText("kenny.lumivale@gmail.com")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
      "href",
      "https://www.linkedin.com/company/lumivale-agency/",
    );
    expect(screen.getByRole("link", { name: "Book a call" })).toHaveAttribute(
      "href", defaultSiteContent.footerCtaButtonUrl,
    );
    expect(container.querySelectorAll("footer")).toHaveLength(1);
    expect(container).not.toHaveTextContent(/Premium websites/i);
    expect(container).not.toHaveTextContent(/SaaS-grade/i);
  });
});

test("renders saved footer copy and destinations", async () => {
  vi.mocked(getSiteContentForSite).mockResolvedValueOnce({ ...defaultSiteContent, footerBrandName: "New brand", footerEmail: "hello@example.com", footerHomeLabel: "Explore", footerHomeUrl: "/explore", footerBottomText: "New bottom text", footerLinkedinUrl: "https://linkedin.com/company/example" });
  render(await SiteFooter());
  expect(screen.getByText("New brand")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "hello@example.com" })).toHaveAttribute("href", "mailto:hello@example.com");
  expect(screen.getByRole("link", { name: "Explore" })).toHaveAttribute("href", "/explore");
  expect(screen.getByText("New bottom text")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", "https://linkedin.com/company/example");
});
