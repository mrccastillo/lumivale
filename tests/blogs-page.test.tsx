import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import BlogsPage from "@/app/blogs/page";

describe("blogs page", () => {
  test("renders the designed blogs landing page with article cards", async () => {
    render(await BlogsPage());

    expect(
      screen.getByRole("heading", { name: "Blogs", level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Field notes on positioning, website strategy, and building a digital presence that earns trust faster.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Why premium service brands need proof before polish",
        level: 2,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Positioning")).toBeInTheDocument();
  });
});
