import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import AdminTestimonialsPage from "@/app/admin/testimonials/page";

vi.mock("@/lib/admin-auth", () => ({
  requireAdminAccess: vi.fn().mockResolvedValue({
    adminId: "admin-1",
    email: "admin@example.com",
  }),
}));

vi.mock("@/lib/mongodb", () => ({
  getMongoDb: vi.fn().mockResolvedValue("test-db"),
}));

vi.mock("@/lib/testimonials", () => ({
  getAdminTestimonials: vi.fn().mockResolvedValue(
    Array.from({ length: 7 }, (_, index) => ({
      id: `testimonial-${index + 1}`,
      personName: index === 0 ? "Maya Lee" : index === 1 ? "Jon Ramos" : `Person ${index + 1}`,
      personTitle:
        index === 0
          ? "Founder, Northstar"
          : index === 1
            ? "CEO, Signal Labs"
            : `Role ${index + 1}`,
      quote:
        index === 0
          ? "Lumivale made growth activity simpler to repeat."
          : index === 1
            ? "The execution support helped us move faster."
            : `Quote ${index + 1}`,
      sortOrder: index + 1,
      status: index < 4 ? "published" : "draft",
      type: index % 2 === 0 ? "text" : "video",
      videoUrl:
        index % 2 === 0
          ? ""
          : `https://res.cloudinary.com/demo/video/upload/video-${index + 1}.mp4`,
      createdAt: new Date(`2026-05-0${Math.min(index + 1, 9)}T08:00:00.000Z`),
      updatedAt: new Date(`2026-05-0${Math.min(index + 1, 9)}T08:00:00.000Z`),
    })),
  ),
}));

describe("admin testimonials dashboard", () => {
  test("renders dashboard stats and management controls", async () => {
    render(await AdminTestimonialsPage({ searchParams: Promise.resolve({}) }));

    expect(
      screen.getByRole("heading", { name: "Testimonials", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Content Management")).toBeInTheDocument();
    expect(screen.getByText("Matching testimonials")).toBeInTheDocument();
    expect(screen.getByText("Published on page")).toBeInTheDocument();
    expect(screen.getByText("Drafts on page")).toBeInTheDocument();
    expect(screen.getByText("Current mode")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "New testimonial" })).toHaveAttribute(
      "href",
      "/admin/testimonials?mode=create",
    );
    expect(
      screen.getByRole("searchbox", { name: "Search name, title, or quote" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Published" })).toHaveAttribute(
      "href",
      "/admin/testimonials?status=published",
    );
    expect(screen.getByRole("link", { name: "Video" })).toHaveAttribute(
      "href",
      "/admin/testimonials?type=video",
    );
    expect(screen.getByRole("link", { name: "New testimonial" })).toHaveClass(
      "bg-[var(--lumivale-panel)]",
    );
  });

  test("filters testimonials by status, type, and search query", async () => {
    render(
      await AdminTestimonialsPage({
        searchParams: Promise.resolve({
          q: "signal",
          status: "published",
          type: "video",
        }),
      }),
    );

    expect(screen.getByRole("heading", { name: "Jon Ramos", level: 2 })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Maya Lee", level: 2 })).not.toBeInTheDocument();
    expect(screen.getByDisplayValue("signal")).toBeInTheDocument();
    expect(screen.getByText("Published")).toHaveClass("bg-[var(--lumivale-admin-chip)]");
    expect(screen.getByText("Video")).toHaveClass("bg-[var(--lumivale-admin-chip)]");
  });

  test("paginates testimonial cards six per page", async () => {
    render(await AdminTestimonialsPage({ searchParams: Promise.resolve({ page: "2" }) }));

    expect(screen.queryByRole("heading", { name: "Maya Lee", level: 2 })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Person 7", level: 2 })).toBeInTheDocument();
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute(
      "href",
      "/admin/testimonials?page=1",
    );
  });

  test("reopens the create modal and shows the error banner when mode=create has an error", async () => {
    render(
      await AdminTestimonialsPage({
        searchParams: Promise.resolve({
          mode: "create",
          error: "Testimonial video must be 50MB or smaller.",
        }),
      }),
    );

    expect(screen.getByRole("dialog", { name: "Create Testimonial" })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Testimonial video must be 50MB or smaller.",
    );
    expect(screen.getByRole("button", { name: "Create testimonial" })).toBeInTheDocument();
  });
});
