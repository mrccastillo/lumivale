import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import AdminServicesPage from "@/app/admin/services/page";

vi.mock("@/lib/admin-auth", () => ({
  requireAdminAccess: vi.fn().mockResolvedValue({
    adminId: "admin-1",
    email: "admin@example.com",
  }),
}));

vi.mock("@/lib/mongodb", () => ({
  getMongoDb: vi.fn().mockResolvedValue("test-db"),
}));

vi.mock("@/lib/services", () => ({
  getAdminServices: vi.fn().mockResolvedValue(
    Array.from({ length: 7 }, (_, index) => ({
      slug: index === 0 ? "comment-campaign" : `service-${index + 1}`,
      title: index === 0 ? "Comment Campaign" : `Service ${index + 1}`,
      summary:
        index === 0
          ? "Post targeted comments on relevant threads."
          : `Summary ${index + 1}.`,
      description:
        index === 0
          ? "Posting targeted comments to increase awareness."
          : `Description ${index + 1}.`,
      highlights: [`Highlight ${index + 1}`],
      sortOrder: index + 1,
      status: index < 4 ? "published" : "draft",
      isDefault: index === 0,
      createdAt: new Date(`2026-05-0${Math.min(index + 1, 9)}T08:00:00.000Z`),
      updatedAt: new Date(`2026-05-0${Math.min(index + 1, 9)}T08:00:00.000Z`),
      privateContent: {
        exampleCards: [],
        examplePlatform: "Reddit",
        heroDescription: "Private service detail.",
        pricePreview: index === 0 ? "Starting at $850/mo" : `$${index + 1}00/mo`,
        pricingLines: [{ label: "Monthly rate", value: `$${index + 1}00` }],
      },
    })),
  ),
}));

describe("admin services dashboard", () => {
  test("renders dashboard stats and management controls", async () => {
    render(await AdminServicesPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { name: "Services", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Service Management")).toBeInTheDocument();
    expect(screen.getByText("Matching services")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Published" })).toBeInTheDocument();
    expect(screen.getByText("Drafts")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "New Service" })).toHaveAttribute(
      "href",
      "/admin/services?mode=create",
    );
    expect(screen.getByRole("searchbox", { name: "Search services" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Draft" })).toHaveAttribute(
      "href",
      "/admin/services?status=draft",
    );
  });

  test("filters services by status and search query", async () => {
    render(
      await AdminServicesPage({
        searchParams: Promise.resolve({
          q: "comment",
          status: "published",
        }),
      }),
    );

    expect(screen.getByRole("heading", { name: "Comment Campaign", level: 2 })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Service 2", level: 2 })).not.toBeInTheDocument();
    expect(screen.getByDisplayValue("comment")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Published" })).toHaveClass(
      "bg-[var(--lumivale-admin-chip)]",
    );
  });

  test("paginates service cards six per page", async () => {
    render(await AdminServicesPage({ searchParams: Promise.resolve({ page: "2" }) }));

    expect(
      screen.queryByRole("heading", { name: "Comment Campaign", level: 2 }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Service 7", level: 2 })).toBeInTheDocument();
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute(
      "href",
      "/admin/services?page=1",
    );
  });

  test("reopens the create modal and shows the error banner when mode=create has an error", async () => {
    render(
      await AdminServicesPage({
        searchParams: Promise.resolve({
          mode: "create",
          error: "Add at least one complete pricing line.",
        }),
      }),
    );

    expect(screen.getByRole("dialog", { name: "Create Service" })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Add at least one complete pricing line.");
    expect(screen.getByRole("button", { name: "Create Service" })).toBeInTheDocument();
  });
});
