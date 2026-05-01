import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import AboutPage from "@/app/about/page";

describe("about page", () => {
  test("renders the designed about me page with positioning and principles", async () => {
    render(await AboutPage());

    expect(
      screen.getByRole("heading", { name: "About Me", level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Lumivale is a founder-led studio for service brands that need a website with the clarity of a pitch deck and the polish of a SaaS product.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "How I work", level: 2 })).toBeInTheDocument();
    expect(screen.getByText("Clarity before visuals")).toBeInTheDocument();
  });
});
