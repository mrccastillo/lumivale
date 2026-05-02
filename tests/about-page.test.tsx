import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import AboutPage from "@/app/about/page";

describe("about page", () => {
  test("renders a single-section About Us page with real Lumivale positioning", async () => {
    const { container } = render(await AboutPage());
    const sections = container.querySelectorAll("section");
    const aboutSection = sections[0];

    expect(
      screen.getByRole("heading", { name: "About Us", level: 1 }),
    ).toBeInTheDocument();
    expect(sections).toHaveLength(1);
    expect(aboutSection).toHaveClass("bg-white", "pt-32", "pb-24");
    expect(aboutSection).not.toHaveAttribute("data-nav-surface", "dark");
    expect(aboutSection?.className).not.toContain("linear-gradient");
    expect(
      screen.getByText(
        "Lumivale is a growth partner for early-stage teams that need clear channels, affordable execution, and hands-on support without agency jargon.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("A compact growth partner for early-stage teams.")).toBeInTheDocument();
    expect(screen.getByText("What we support")).toBeInTheDocument();
    expect(screen.getByText("We keep it Simple.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Book a call" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "View case studies" })).not.toBeInTheDocument();
    expect(container).not.toHaveTextContent(/premium website/i);
    expect(container).not.toHaveTextContent(/SaaS-grade/i);
    expect(container).not.toHaveTextContent(/website strategy/i);
  });
});
