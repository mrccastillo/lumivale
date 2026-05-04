import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import AdminUsersPage from "@/app/admin/users/page";

vi.mock("@/lib/admin-auth", () => ({
  requireAdminAccess: vi.fn().mockResolvedValue({
    adminId: "admin-1",
    email: "admin@example.com",
  }),
}));

vi.mock("@/lib/mongodb", () => ({
  getMongoDb: vi.fn().mockResolvedValue("test-db"),
}));

vi.mock("@/lib/admin-users", () => ({
  getAdminUsers: vi.fn().mockResolvedValue([
    {
      id: "admin-1",
      email: "zoe@example.com",
      createdAt: new Date("2026-05-04T08:00:00.000Z"),
      updatedAt: new Date("2026-05-04T08:00:00.000Z"),
    },
    {
      id: "admin-2",
      email: "alex@example.com",
      createdAt: new Date("2026-04-25T08:00:00.000Z"),
      updatedAt: new Date("2026-04-25T08:00:00.000Z"),
    },
    {
      id: "admin-3",
      email: "marc@example.com",
      createdAt: new Date("2026-03-01T08:00:00.000Z"),
      updatedAt: new Date("2026-03-01T08:00:00.000Z"),
    },
  ]),
}));

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-05-05T08:00:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("admin users dashboard", () => {
  test("renders the minimalist dashboard, metrics, and toolbar", async () => {
    render(await AdminUsersPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { name: "Users", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Admin Directory")).toBeInTheDocument();
    expect(screen.getByText("Total admins")).toBeInTheDocument();
    expect(screen.getByText("Visible results")).toBeInTheDocument();
    expect(screen.getByText("Newest account")).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Search admin email" })).toBeInTheDocument();
    expect(screen.getByLabelText("Sort")).toBeInTheDocument();
    expect(screen.getByLabelText("Range")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "zoe@example.com", level: 3 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create admin" })).toHaveClass(
      "bg-[var(--lumivale-panel)]",
    );
  });

  test("filters admins by search and recency range", async () => {
    render(
      await AdminUsersPage({
        searchParams: Promise.resolve({ q: "alex", range: "recent" }),
      }),
    );

    expect(screen.getByText("alex@example.com")).toBeInTheDocument();
    expect(screen.queryByText("zoe@example.com")).not.toBeInTheDocument();
    expect(screen.queryByText("marc@example.com")).not.toBeInTheDocument();
    expect(screen.getByDisplayValue("alex")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Recent 30 days")).toBeInTheDocument();
  });

  test("sorts admins by oldest first", async () => {
    render(
      await AdminUsersPage({
        searchParams: Promise.resolve({ sort: "oldest" }),
      }),
    );

    const headings = screen.getAllByRole("heading", { level: 3 });

    expect(headings[0]).toHaveTextContent("marc@example.com");
    expect(headings[1]).toHaveTextContent("alex@example.com");
    expect(headings[2]).toHaveTextContent("zoe@example.com");
  });

  test("shows a no-match state when filters remove every admin", async () => {
    render(
      await AdminUsersPage({
        searchParams: Promise.resolve({ q: "missing", range: "older" }),
      }),
    );

    expect(screen.getByText("No matching admins.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Clear filters" })).toHaveAttribute(
      "href",
      "/admin/users",
    );
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create admin" })).toBeInTheDocument();
  });
});
