import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import AdminTrustedClientsPage from "@/app/admin/trusted-clients/page";

const getTrustedClientsMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/admin-auth", () => ({
  requireAdminAccess: vi.fn().mockResolvedValue({
    adminId: "admin-1",
    email: "admin@example.com",
  }),
}));

vi.mock("@/lib/mongodb", () => ({
  getMongoDb: vi.fn().mockResolvedValue("test-db"),
}));

vi.mock("@/lib/trusted-clients", () => ({
  getTrustedClients: getTrustedClientsMock,
}));

beforeEach(() => {
  getTrustedClientsMock.mockResolvedValue([
    {
      id: "trusted-1",
      email: "zoe@example.com",
      createdAt: new Date("2026-05-04T08:00:00.000Z"),
      updatedAt: new Date("2026-05-04T08:00:00.000Z"),
    },
    {
      id: "trusted-2",
      email: "alex@example.com",
      createdAt: new Date("2026-05-06T08:00:00.000Z"),
      updatedAt: new Date("2026-05-06T08:00:00.000Z"),
    },
  ]);
});

describe("admin trusted clients dashboard", () => {
  test("renders metrics, search, sort, and list rows", async () => {
    render(await AdminTrustedClientsPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByText("Total trusted clients")).toBeInTheDocument();
    expect(screen.getByText("Visible results")).toBeInTheDocument();
    expect(
      screen.getByRole("searchbox", { name: "Search trusted client email" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Sort")).toBeInTheDocument();
    expect(screen.getByText("zoe@example.com")).toBeInTheDocument();
    expect(screen.getByText("alex@example.com")).toBeInTheDocument();
  });

  test("filters trusted clients by email query", async () => {
    render(await AdminTrustedClientsPage({ searchParams: Promise.resolve({ q: "alex" }) }));

    expect(screen.getByText("alex@example.com")).toBeInTheDocument();
    expect(screen.queryByText("zoe@example.com")).not.toBeInTheDocument();
  });

  test("sorts trusted clients by email", async () => {
    render(await AdminTrustedClientsPage({ searchParams: Promise.resolve({ sort: "email" }) }));

    const headings = screen.getAllByRole("heading", { level: 3 });

    expect(headings.map((heading) => heading.textContent)).toEqual([
      "alex@example.com",
      "zoe@example.com",
    ]);
  });

  test("shows a no-match state when search removes every record", async () => {
    render(await AdminTrustedClientsPage({ searchParams: Promise.resolve({ q: "missing" }) }));

    expect(screen.getByText("No matching trusted clients.")).toBeInTheDocument();
  });

  test("shows an empty state when no trusted clients exist", async () => {
    getTrustedClientsMock.mockResolvedValueOnce([]);

    render(await AdminTrustedClientsPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByText("No trusted clients yet.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add trusted client" })).toBeInTheDocument();
  });
});
