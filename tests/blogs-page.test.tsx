import { render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";

import styles from "@/components/public-listing.module.css";
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
      coverImageUrl: "https://res.cloudinary.com/demo/image/upload/cover-1.jpg",
      coverAlt: "Published post cover",
      createdAt: new Date("2026-05-03T08:00:00.000Z"),
      updatedAt: new Date("2026-05-03T08:00:00.000Z"),
    },
  ]),
}));

beforeAll(() => { vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} }); });
afterAll(() => vi.unstubAllGlobals());

describe("blogs page", () => {
  test("renders published MongoDB article cards", async () => {
    const { container } = render(await BlogsPage());
    const headerSection = container.querySelector("header");

    expect(
      screen.getByRole("heading", { name: "Blogs", level: 1 }),
    ).toBeInTheDocument();
    expect(container.querySelector("section")).not.toHaveTextContent("Insights");
    expect(headerSection).toHaveClass(styles.hero);
    expect(headerSection).not.toHaveClass("pt-24", "pb-14", "py-20");
    expect(headerSection).not.toHaveAttribute("data-nav-surface", "dark");
    expect(headerSection?.className).not.toContain("linear-gradient");
    expect(
      screen.getByText(
        "Gain valuable insight from our team on relevant industry news, emerging trends, and practical marketing strategies to help you stay ahead.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Published Post", level: 3 })).toBeInTheDocument();
    expect(screen.getAllByText("CMS").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("img", { name: "Published post cover" })).toHaveAttribute(
      "src",
      "https://res.cloudinary.com/demo/image/upload/cover-1.jpg",
    );

    for (const post of await getPublicBlogPosts("test-db")) {
      expect(
        screen.getByRole("link", { name: `Read ${post.title}` }),
      ).toHaveAttribute("href", `/blogs/${post.slug}`);
    }

    expect(container.querySelector("section")).toHaveClass(styles.journal);
    expect(screen.getByRole("link", { name: "Read Published Post" })).toHaveClass(
      styles.featured,
    );
    expect(container.querySelectorAll("article")[0]).toHaveClass(styles.postCopy);
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
        level: 3,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "What a practical UGC publishing cadence looks like for early teams.",
        level: 3,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Keeping outreach simple without losing consistency or intent.",
        level: 3,
      }),
    ).toBeInTheDocument();
    expect(container).toHaveTextContent("Placeholder article");
  });
});
