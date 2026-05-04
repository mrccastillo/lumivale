import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import AdminBlogsPage from "@/app/admin/blogs/page";

vi.mock("@/lib/admin-auth", () => ({
  requireAdminAccess: vi.fn().mockResolvedValue({
    adminId: "admin-1",
    email: "admin@example.com",
  }),
}));

vi.mock("@/lib/mongodb", () => ({
  getMongoDb: vi.fn().mockResolvedValue("test-db"),
}));

vi.mock("@/lib/blogs", () => ({
  getAdminBlogPosts: vi.fn().mockResolvedValue(
    Array.from({ length: 7 }, (_, index) => ({
      id: `post-${index + 1}`,
      slug: index === 0 ? "growth-systems" : `post-${index + 1}`,
      category: "Growth",
      title: index === 0 ? "Growth Systems" : `Post ${index + 1}`,
      excerpt: `Excerpt ${index + 1}`,
      body: "Body",
      readTime: "4 min read",
      tags: ["growth"],
      seoTitle: "",
      seoDescription: "",
      status: index < 4 ? "published" : "draft",
      coverImageId: index === 0 ? "cover-1" : "",
      coverAlt: "Cover image",
      createdAt: new Date(`2026-05-0${Math.min(index + 1, 9)}T08:00:00.000Z`),
      updatedAt: new Date(`2026-05-0${Math.min(index + 1, 9)}T08:00:00.000Z`),
    })),
  ),
}));

describe("admin blogs dashboard", () => {
  test("renders dashboard stats and management controls", async () => {
    render(await AdminBlogsPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { name: "Blogs", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Content Management")).toBeInTheDocument();
    expect(screen.getByText("Matching posts")).toBeInTheDocument();
    expect(screen.getByText("Published on page")).toBeInTheDocument();
    expect(screen.getByText("Drafts on page")).toBeInTheDocument();
    expect(screen.getByText("Current mode")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "New Blog" })).toHaveAttribute(
      "href",
      "/admin/blogs?mode=create",
    );
    expect(screen.getByRole("searchbox", { name: "Search title or slug" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Published" })).toHaveAttribute(
      "href",
      "/admin/blogs?status=published",
    );
    expect(screen.getByRole("link", { name: "New Blog" })).toHaveClass(
      "bg-[var(--lumivale-panel)]",
    );
  });

  test("filters posts by status and search query", async () => {
    render(
      await AdminBlogsPage({
        searchParams: Promise.resolve({ q: "growth", status: "published" }),
      }),
    );

    expect(screen.getByRole("heading", { name: "Growth Systems", level: 2 })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Post 2", level: 2 })).not.toBeInTheDocument();
    expect(screen.getByDisplayValue("growth")).toBeInTheDocument();
    expect(screen.getByText("Published")).toHaveClass("bg-[var(--lumivale-admin-chip)]");
  });

  test("paginates blog cards six per page", async () => {
    render(await AdminBlogsPage({ searchParams: Promise.resolve({ page: "2" }) }));

    expect(screen.queryByRole("heading", { name: "Growth Systems", level: 2 })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Post 7", level: 2 })).toBeInTheDocument();
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute(
      "href",
      "/admin/blogs?page=1",
    );
  });

  test("shows a no-match state for filters without results", async () => {
    render(
      await AdminBlogsPage({
        searchParams: Promise.resolve({ q: "missing", status: "draft" }),
      }),
    );

    expect(screen.getByText("No matching posts.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Clear filters" })).toHaveAttribute(
      "href",
      "/admin/blogs",
    );
  });

  test("shows the create blog form inside the blogs page", async () => {
    render(await AdminBlogsPage({ searchParams: Promise.resolve({ mode: "create" }) }));

    expect(screen.getAllByRole("heading", { name: "Create Blog Post", level: 2 }).length).toBeGreaterThan(0);
    expect(
      screen.queryByRole("heading", { name: "Browse And Manage Posts", level: 2 }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View Blogs" })).toHaveAttribute(
      "href",
      "/admin/blogs",
    );
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Blog Link Ending")).toBeInTheDocument();
    expect(screen.getByLabelText("Upload cover image")).toHaveAttribute(
      "accept",
      "image/png,image/jpeg,image/webp,image/gif",
    );
    expect(screen.getByRole("button", { name: "Create Blog Post" })).toBeInTheDocument();
  });
});
