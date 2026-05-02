import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import BlogDetailPage, {
  generateStaticParams,
} from "@/app/blogs/[slug]/page";
import { getAllBlogPosts, getBlogPostBySlug } from "@/lib/blogs";

describe("blog data and detail pages", () => {
  test("lists blog posts with slugs for index and detail routes", () => {
    const posts = getAllBlogPosts();

    expect(posts.map((post) => post.slug)).toEqual([
      "comment-campaigns-create-early-awareness",
      "short-form-content-needs-consistent-output",
      "direct-outreach-easier-to-repeat",
    ]);
    expect(posts.every((post) => post.title && post.body)).toBe(true);
  });

  test("looks up blog posts by slug", () => {
    const [firstPost] = getAllBlogPosts();

    expect(getBlogPostBySlug(firstPost.slug)).toEqual(firstPost);
    expect(getBlogPostBySlug("missing-post")).toBeUndefined();
  });

  test("generates static params for every blog post", async () => {
    const params = await generateStaticParams();

    expect(params).toEqual(
      getAllBlogPosts().map((post) => ({ slug: post.slug })),
    );
  });

  test("renders the full blog detail page", async () => {
    const post = getBlogPostBySlug("comment-campaigns-create-early-awareness");

    if (!post) {
      throw new Error("Expected seeded comment campaign blog post");
    }

    render(
      await BlogDetailPage({
        params: Promise.resolve({ slug: post.slug }),
      }),
    );

    expect(screen.getByRole("heading", { level: 1, name: post.title })).toBeInTheDocument();
    expect(screen.getByLabelText(`${post.category} placeholder image`)).toBeInTheDocument();
    expect(screen.getByText(post.excerpt)).toBeInTheDocument();
    expect(screen.getByText(post.body)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Blogs" })).toHaveAttribute("href", "/blogs");
  });

  test("rejects unknown blog slugs", async () => {
    await expect(
      BlogDetailPage({
        params: Promise.resolve({ slug: "missing-post" }),
      }),
    ).rejects.toThrow();
  });
});
