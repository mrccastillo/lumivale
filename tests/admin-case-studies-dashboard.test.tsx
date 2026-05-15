import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import AdminCaseStudiesPage from "@/app/admin/case-studies/page";

vi.mock("@/lib/admin-auth", () => ({
  requireAdminAccess: vi.fn().mockResolvedValue({
    adminId: "admin-1",
    email: "admin@example.com",
  }),
}));

vi.mock("@/lib/mongodb", () => ({
  getMongoDb: vi.fn().mockResolvedValue("test-db"),
}));

vi.mock("@/lib/case-studies", () => ({
  getAdminCaseStudies: vi.fn().mockResolvedValue(
    Array.from({ length: 7 }, (_, index) => ({
      slug: index === 0 ? "comment-awareness-sprint" : `case-study-${index + 1}`,
      title: index === 0 ? "Comment Awareness Sprint" : `Case Study ${index + 1}`,
      category: index === 0 ? "Awareness" : "Content",
      headline:
        index === 0
          ? "100-140 targeted comments per month"
          : `${index + 1} measurable wins`,
      summary:
        index === 0
          ? "A focused comment campaign built for relevant conversations."
          : `Summary ${index + 1}.`,
      challenge: `Challenge ${index + 1}.`,
      solution: `Solution ${index + 1}.`,
      outcomes: [`Outcome ${index + 1}`],
      metrics: [{ value: `${index + 1}00`, label: "qualified conversations" }],
      sortOrder: index + 1,
      status: index < 4 ? "published" : "draft",
      isDefault: index === 0,
      createdAt: new Date(`2026-05-0${Math.min(index + 1, 9)}T08:00:00.000Z`),
      updatedAt: new Date(`2026-05-0${Math.min(index + 1, 9)}T08:00:00.000Z`),
    })),
  ),
}));

describe("admin case studies dashboard", () => {
  test("renders dashboard stats and management controls", async () => {
    render(await AdminCaseStudiesPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { name: "Case Studies", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Story Management")).toBeInTheDocument();
    expect(screen.getByText("Matching stories")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Published" })).toBeInTheDocument();
    expect(screen.getByText("Drafts")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "New Case Study" })).toHaveAttribute(
      "href",
      "/admin/case-studies?mode=create",
    );
    expect(screen.getByRole("searchbox", { name: "Search case studies" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Draft" })).toHaveAttribute(
      "href",
      "/admin/case-studies?status=draft",
    );
  });

  test("filters case studies by status and search query", async () => {
    render(
      await AdminCaseStudiesPage({
        searchParams: Promise.resolve({ q: "comment", status: "published" }),
      }),
    );

    expect(
      screen.getByRole("heading", { name: "Comment Awareness Sprint", level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Case Study 2", level: 2 }),
    ).not.toBeInTheDocument();
    expect(screen.getByDisplayValue("comment")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Published" })).toHaveClass(
      "bg-[var(--lumivale-admin-chip)]",
    );
  });

  test("paginates case study cards six per page", async () => {
    render(await AdminCaseStudiesPage({ searchParams: Promise.resolve({ page: "2" }) }));

    expect(
      screen.queryByRole("heading", { name: "Comment Awareness Sprint", level: 2 }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Case Study 7", level: 2 })).toBeInTheDocument();
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute(
      "href",
      "/admin/case-studies?page=1",
    );
  });

  test("shows the create case study form inside the dashboard", async () => {
    render(await AdminCaseStudiesPage({ searchParams: Promise.resolve({ mode: "create" }) }));

    expect(
      screen.getByRole("heading", { name: "Create Case Study", level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Browse And Manage Stories", level: 2 }),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Case Study Link Ending")).toBeInTheDocument();
    expect(screen.getByLabelText("Metrics")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Case Study" })).toBeInTheDocument();
  });
});
