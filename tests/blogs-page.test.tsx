import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import BlogsPage from "@/app/blogs/page";
import { getAllBlogPosts } from "@/lib/blogs";

describe("blogs page", () => {
  test("renders growth-channel article cards", async () => {
    const { container } = render(await BlogsPage());
    const headerSection = container.querySelector("section");

    expect(
      screen.getByRole("heading", { name: "Blogs", level: 1 }),
    ).toBeInTheDocument();
    expect(container.querySelector("section")).not.toHaveTextContent("Insights");
    expect(headerSection).toHaveClass("bg-white", "py-16", "pt-32");
    expect(headerSection).not.toHaveClass("pt-24", "pb-14", "py-20");
    expect(headerSection).not.toHaveAttribute("data-nav-surface", "dark");
    expect(headerSection?.className).not.toContain("linear-gradient");
    expect(
      screen.getByText(
        "Field notes on comment campaigns, creator-led content, outreach, and direct response systems that help teams find traction.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "How comment campaigns create early awareness",
        level: 2,
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Comment Campaigns").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByLabelText("Comment Campaigns placeholder image")).toBeInTheDocument();
    expect(screen.getAllByText("Image placeholder").length).toBeGreaterThanOrEqual(1);
    for (const post of getAllBlogPosts()) {
      expect(
        screen.getByRole("link", { name: `Read ${post.title}` }),
      ).toHaveAttribute(
        "href",
        `/blogs/${post.slug}`,
      );
    }
    expect(container.querySelectorAll("section")[1]).toHaveClass("py-12");
    expect(
      screen.getByRole("link", {
        name: "Read How comment campaigns create early awareness",
      }),
    ).toHaveClass("min-h-[320px]", "overflow-hidden");
    expect(container.querySelectorAll("article")[0]).toHaveClass("p-4", "sm:p-5");
    expect(container).not.toHaveTextContent(/premium service brands/i);
    expect(container).not.toHaveTextContent(/website strategy/i);
  });
});
