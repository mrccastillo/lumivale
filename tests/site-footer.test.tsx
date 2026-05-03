import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { SiteFooter } from "@/components/site-footer";

describe("site footer", () => {
  test("renders a dark Lumivale footer with growth copy and contact CTA", () => {
    const { container } = render(<SiteFooter />);

    expect(container.querySelector("footer")).toHaveAttribute("data-theme", "dark");
    expect(screen.getByText("Lumivale")).toBeInTheDocument();
    expect(screen.getByText("Light up your growth.")).toBeInTheDocument();
    expect(screen.getByText("kenny.lumivale@gmail.com")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
      "href",
      "https://www.linkedin.com/company/lumivale-agency/",
    );
    expect(screen.getByRole("link", { name: "Admin login" })).toHaveAttribute(
      "href",
      "/admin/login",
    );
    expect(screen.getByRole("link", { name: "Admin login" })).toHaveClass(
      "opacity-35",
    );
    expect(screen.queryByRole("link", { name: "Book a call" })).not.toBeInTheDocument();
    expect(container).not.toHaveTextContent(/Premium websites/i);
    expect(container).not.toHaveTextContent(/SaaS-grade/i);
  });
});
