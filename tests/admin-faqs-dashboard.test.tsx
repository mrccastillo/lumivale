import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

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
    Array.from({ length: 12 }, (_, index) => ({
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
      status: index < 5 ? "published" : "draft",
      createdAt: new Date(`2026-05-0${Math.min(index + 1, 9)}T08:00:00.000Z`),
      updatedAt: new Date(`2026-05-0${Math.min(index + 1, 9)}T08:00:00.000Z`),
    })),
  ),
}));

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ ok: true }),
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("admin FAQs dashboard", () => {
  test("renders dashboard stats and management controls", async () => {
    render(await AdminFaqsPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { name: "FAQs", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Content Management")).toBeInTheDocument();
    expect(screen.getAllByText("Displayed FAQs").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Not displayed")).toBeInTheDocument();
    expect(screen.getByText("Published in view")).toBeInTheDocument();
    expect(screen.getByText("Drafts in view")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "New FAQ" })).toHaveAttribute(
      "href",
      "/admin/faqs?mode=create",
    );
    expect(screen.getByRole("searchbox", { name: "Search question or answer" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Published" })).toHaveAttribute(
      "href",
      "/admin/faqs?status=published",
    );
    expect(screen.getByRole("link", { name: "Displayed (5/5)" })).toHaveAttribute(
      "href",
      "/admin/faqs",
    );
    expect(screen.getByRole("link", { name: "Not displayed (7)" })).toHaveAttribute(
      "href",
      "/admin/faqs?visibility=not-displayed",
    );
    expect(screen.getByText("Drag to reorder FAQs")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save order" })).toBeDisabled();
  });

  test("enables saving after FAQ cards are reordered", async () => {
    const { container } = render(await AdminFaqsPage({ searchParams: Promise.resolve({}) }));
    const orderInput = container.querySelector<HTMLInputElement>("input[name='order']");

    expect(orderInput?.value).toBe(
      JSON.stringify([
        "faq-1",
        "faq-2",
        "faq-3",
        "faq-4",
        "faq-5",
        "faq-6",
        "faq-7",
        "faq-8",
        "faq-9",
        "faq-10",
        "faq-11",
        "faq-12",
      ]),
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Move How soon can Lumivale start? down" }),
    );

    expect(fetch).toHaveBeenCalledWith(
      "/api/admin/faqs/reorder",
      expect.objectContaining({
        method: "POST",
        headers: {
          "X-FAQ-Reorder": "autosave",
        },
      }),
    );
    expect(orderInput?.value).toBe(
      JSON.stringify([
        "faq-2",
        "faq-1",
        "faq-3",
        "faq-4",
        "faq-5",
        "faq-6",
        "faq-7",
        "faq-8",
        "faq-9",
        "faq-10",
        "faq-11",
        "faq-12",
      ]),
    );
  });

  test("separates FAQs that are not displayed on the homepage", async () => {
    render(
      await AdminFaqsPage({
        searchParams: Promise.resolve({ visibility: "not-displayed" }),
      }),
    );

    expect(screen.getByText("Not displayed FAQs")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "How soon can Lumivale start?", level: 2 }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Question 6?", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Question 11?", level: 2 })).toBeInTheDocument();
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
    render(
      await AdminFaqsPage({
        searchParams: Promise.resolve({ page: "2", visibility: "not-displayed" }),
      }),
    );

    expect(
      screen.queryByRole("heading", { name: "Question 6?", level: 2 }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Question 12?", level: 2 })).toBeInTheDocument();
    expect(screen.getByText(/Page 2 of 2/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute(
      "href",
      "/admin/faqs?visibility=not-displayed&page=1",
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
