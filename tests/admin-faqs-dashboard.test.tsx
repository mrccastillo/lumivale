import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import AdminFaqsPage from "@/app/admin/faqs/page";

vi.mock("@/lib/admin-auth", () => ({
  requireAdminAccess: vi.fn().mockResolvedValue({
    adminId: "admin-1",
    email: "admin@example.com",
  }),
}));

vi.mock("@/lib/mongodb", () => ({
  getMongoDb: vi.fn().mockResolvedValue("test-db"),
}));

vi.mock("@/lib/faqs", () => ({
  getAdminFaqs: vi.fn().mockResolvedValue(
    Array.from({ length: 7 }, (_, index) => ({
      id: `faq-${index + 1}`,
      question:
        index === 0
          ? "How soon can Lumivale start?"
          : index === 1
            ? "Can we choose only one channel?"
            : `Question ${index + 1}?`,
      answer:
        index === 0
          ? "Most projects can begin after a short discovery call."
          : index === 1
            ? "Yes. You can start with one focused growth channel."
            : `Answer ${index + 1}.`,
      sortOrder: index + 1,
      status: index < 4 ? "published" : "draft",
      createdAt: new Date(`2026-05-0${Math.min(index + 1, 9)}T08:00:00.000Z`),
      updatedAt: new Date(`2026-05-0${Math.min(index + 1, 9)}T08:00:00.000Z`),
    })),
  ),
}));

describe("admin FAQs dashboard", () => {
  test("renders dashboard stats and management controls", async () => {
    render(await AdminFaqsPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { name: "FAQs", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Content Management")).toBeInTheDocument();
    expect(screen.getByText("Matching FAQs")).toBeInTheDocument();
    expect(screen.getByText("Published on page")).toBeInTheDocument();
    expect(screen.getByText("Drafts on page")).toBeInTheDocument();
    expect(screen.getByText("Current mode")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "New FAQ" })).toHaveAttribute(
      "href",
      "/admin/faqs?mode=create",
    );
    expect(screen.getByRole("searchbox", { name: "Search question or answer" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Published" })).toHaveAttribute(
      "href",
      "/admin/faqs?status=published",
    );
  });

  test("filters FAQs by status and search query", async () => {
    render(
      await AdminFaqsPage({
        searchParams: Promise.resolve({
          q: "channel",
          status: "published",
        }),
      }),
    );

    expect(
      screen.getByRole("heading", { name: "Can we choose only one channel?", level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "How soon can Lumivale start?", level: 2 }),
    ).not.toBeInTheDocument();
    expect(screen.getByDisplayValue("channel")).toBeInTheDocument();
    expect(screen.getByText("Published")).toHaveClass("bg-[var(--lumivale-admin-chip)]");
  });

  test("paginates FAQ cards six per page", async () => {
    render(await AdminFaqsPage({ searchParams: Promise.resolve({ page: "2" }) }));

    expect(
      screen.queryByRole("heading", { name: "How soon can Lumivale start?", level: 2 }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Question 7?", level: 2 })).toBeInTheDocument();
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute(
      "href",
      "/admin/faqs?page=1",
    );
  });

  test("reopens the create modal and shows the error banner when mode=create has an error", async () => {
    render(
      await AdminFaqsPage({
        searchParams: Promise.resolve({
          mode: "create",
          error: "Question and answer are required.",
        }),
      }),
    );

    expect(screen.getByRole("dialog", { name: "Create FAQ" })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Question and answer are required.");
    expect(screen.getByRole("button", { name: "Create FAQ" })).toBeInTheDocument();
  });
});
