import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import BlogsPage from "@/app/blogs/page";
import { getPublicBlogPosts } from "@/lib/blogs";
import { getMongoDb } from "@/lib/mongodb";

vi.mock("@/lib/mongodb", () => ({
  getMongoDb: vi.fn().mockResolvedValue("test-db"),
}));

vi.mock("@/lib/blogs", () => ({
  getPublicBlogPosts: vi.fn().mockResolvedValue([
    {
      id: "post-1",
      slug: "published-post",
      category: "CMS",
      title: "Published Post",
      excerpt: "A published MongoDB post.",
      body: "Body",
      readTime: "5 min read",
      tags: ["cms"],
      seoTitle: "Published Post SEO",
      seoDescription: "Published SEO description",
      status: "published",
      coverImageId: "cover-1",
      coverAlt: "Published post cover",
      createdAt: new Date("2026-05-03T08:00:00.000Z"),
      updatedAt: new Date("2026-05-03T08:00:00.000Z"),
    },
  ]),
}));

describe("blogs page", () => {
  test("renders published MongoDB article cards", async () => {
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
    expect(screen.getByRole("heading", { name: "Published Post", level: 2 })).toBeInTheDocument();
    expect(screen.getAllByText("CMS").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("img", { name: "Published post cover" })).toHaveAttribute(
      "src",
      "/api/blog-images/cover-1",
    );

    for (const post of await getPublicBlogPosts("test-db")) {
      expect(
        screen.getByRole("link", { name: `Read ${post.title}` }),
      ).toHaveAttribute("href", `/blogs/${post.slug}`);
    }

    expect(container.querySelectorAll("section")[1]).toHaveClass("py-12");
    expect(screen.getByRole("link", { name: "Read Published Post" })).toHaveClass(
      "min-h-[320px]",
      "overflow-hidden",
    );
    expect(container.querySelectorAll("article")[0]).toHaveClass("p-4", "sm:p-5");
    expect(container).not.toHaveTextContent(/premium service brands/i);
    expect(container).not.toHaveTextContent(/website strategy/i);
  });

  test("keeps the blogs page available when MongoDB authentication fails", async () => {
    vi.mocked(getMongoDb).mockRejectedValueOnce(new Error("bad auth"));

    const { container } = render(await BlogsPage());

    expect(screen.getByRole("heading", { name: "Blogs", level: 1 })).toBeInTheDocument();
    expect(screen.getAllByText("Placeholder")).toHaveLength(3);
    expect(
      screen.getByRole("heading", {
        name: "How comment campaigns can create warmer inbound attention.",
        level: 2,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "What a practical UGC publishing cadence looks like for early teams.",
        level: 2,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Keeping outreach simple without losing consistency or intent.",
        level: 2,
      }),
    ).toBeInTheDocument();
    expect(container).toHaveTextContent("Article placeholder");
  });
});
