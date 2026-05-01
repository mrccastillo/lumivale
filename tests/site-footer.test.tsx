import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { SiteFooter } from "@/components/site-footer";

describe("site footer", () => {
  test("renders a dark premium footer with brand and contact CTA", () => {
    const { container } = render(<SiteFooter />);

    expect(container.querySelector("footer")).toHaveAttribute("data-theme", "dark");
    expect(screen.getByText("Lumivale")).toBeInTheDocument();
    expect(screen.getByText("Premium websites for service brands.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Book a call" })).toHaveAttribute(
      "href",
      "https://calendly.com/lumivale/discovery-call",
    );
  });
});
