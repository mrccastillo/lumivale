import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import BlogDetailPage, {
  generateStaticParams,
} from "@/app/blogs/[slug]/page";
import { getPublicBlogPostBySlug, getPublicBlogPosts } from "@/lib/blogs";

vi.mock("@/lib/mongodb", () => ({
  getMongoDb: vi.fn().mockResolvedValue("test-db"),
}));

vi.mock("@/lib/blogs", () => ({
  getPublicBlogPosts: vi.fn(),
  getPublicBlogPostBySlug: vi.fn(),
}));

const publishedPost = {
  id: "post-1",
  slug: "published-post",
  category: "CMS",
  title: "Published Post",
  excerpt: "A published MongoDB post.",
  body: "## Launch notes\n\nMarkdown body content.",
  readTime: "5 min read",
  tags: ["cms"],
  seoTitle: "Published Post SEO",
  seoDescription: "Published SEO description",
  status: "published" as const,
  coverImageId: "cover-1",
  coverAlt: "Published post cover",
  createdAt: new Date("2026-05-03T08:00:00.000Z"),
  updatedAt: new Date("2026-05-03T08:00:00.000Z"),
};

describe("blog data and detail pages", () => {
  test("generates static params for every published blog post", async () => {
    vi.mocked(getPublicBlogPosts).mockResolvedValue([publishedPost]);

    const params = await generateStaticParams();

    expect(params).toEqual([{ slug: "published-post" }]);
  });

  test("renders the full blog detail page from MongoDB content", async () => {
    vi.mocked(getPublicBlogPostBySlug).mockResolvedValue(publishedPost);

    render(
      await BlogDetailPage({
        params: Promise.resolve({ slug: publishedPost.slug }),
      }),
    );

    expect(
      screen.getByRole("heading", { level: 1, name: publishedPost.title }),
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: publishedPost.coverAlt })).toHaveAttribute(
      "src",
      `/api/blog-images/${publishedPost.coverImageId}`,
    );
    expect(screen.getByText(publishedPost.excerpt)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Launch notes" })).toBeInTheDocument();
    expect(screen.getByText("Markdown body content.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Blogs" })).toHaveAttribute("href", "/blogs");
  });

  test("rejects unknown blog slugs", async () => {
    vi.mocked(getPublicBlogPostBySlug).mockResolvedValue(null);

    await expect(
      BlogDetailPage({
        params: Promise.resolve({ slug: "missing-post" }),
      }),
    ).rejects.toThrow();
  });
});
