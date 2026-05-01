import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import BlogsPage from "@/app/blogs/page";

describe("blogs page", () => {
  test("renders the placeholder blogs heading and copy", async () => {
    render(await BlogsPage());

    expect(
      screen.getByRole("heading", { name: "Blogs", level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Placeholder copy for future articles, insights, and publishing updates.",
      ),
    ).toBeInTheDocument();
  });
});
