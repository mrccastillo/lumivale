import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import AboutPage from "@/app/about/page";

describe("about page", () => {
  test("renders a clean single-section founder-focused About page", async () => {
    const { container } = render(await AboutPage());
    const sections = container.querySelectorAll("section");
    const aboutSection = sections[0];

    expect(
      screen.getByRole("heading", { name: "Meet the founders", level: 1 }),
    ).toBeInTheDocument();
    expect(sections).toHaveLength(1);
    expect(aboutSection).toHaveClass("bg-white", "pt-32", "py-16");
    expect(aboutSection).not.toHaveAttribute("data-nav-surface", "dark");
    expect(aboutSection?.className).not.toContain("linear-gradient");
    expect(
      screen.getByText(
        "Lumivale is run by a small founding team that pairs strategy, creative execution, and outreach systems for early-stage teams.",
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { name: "John Doe", level: 2 })).toHaveLength(3);
    expect(screen.getAllByAltText("John Doe portrait illustration")).toHaveLength(3);
    expect(screen.queryByText("What we support")).not.toBeInTheDocument();
    expect(screen.queryByText("We keep it Simple.")).not.toBeInTheDocument();
    expect(screen.queryByText("Make it Affordable.")).not.toBeInTheDocument();
    expect(screen.queryByText("Ensure Excellence.")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Book a call" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "View case studies" })).not.toBeInTheDocument();
    expect(container).not.toHaveTextContent(/premium website/i);
    expect(container).not.toHaveTextContent(/SaaS-grade/i);
    expect(container).not.toHaveTextContent(/website strategy/i);
  });
});
