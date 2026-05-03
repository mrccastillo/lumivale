import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import AdminLoginPage from "@/app/admin/login/page";
import AdminTestimonialsPage from "@/app/admin/testimonials/page";
import NewTestimonialPage from "@/app/admin/testimonials/new/page";
import AdminUsersPage from "@/app/admin/users/page";

vi.mock("@/lib/admin-auth", () => ({
  hasAdminAccess: vi.fn().mockResolvedValue(false),
  requireAdminAccess: vi.fn().mockResolvedValue({
    adminId: "admin-1",
    email: "admin@example.com",
  }),
}));

vi.mock("@/lib/mongodb", () => ({
  getMongoDb: vi.fn().mockResolvedValue("test-db"),
}));

vi.mock("@/lib/testimonials", () => ({
  getAdminTestimonials: vi.fn().mockResolvedValue([
    {
      id: "testimonial-1",
      personName: "Maya Lee",
      personTitle: "Founder, Northstar",
      quote: "Lumivale made growth activity simpler to repeat.",
      sortOrder: 1,
      status: "published",
      type: "text",
      videoFileId: "",
      createdAt: new Date("2026-05-03T08:00:00.000Z"),
      updatedAt: new Date("2026-05-03T08:00:00.000Z"),
    },
  ]),
}));

vi.mock("@/lib/admin-users", () => ({
  getAdminUsers: vi.fn().mockResolvedValue([
    {
      id: "admin-1",
      email: "admin@example.com",
      createdAt: new Date("2026-05-03T08:00:00.000Z"),
      updatedAt: new Date("2026-05-03T08:00:00.000Z"),
    },
  ]),
}));

describe("admin pages", () => {
  test("renders the admin login form", () => {
    render(<AdminLoginPage searchParams={Promise.resolve({})} />);

    expect(
      screen.getByRole("heading", { name: "Admin Login", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
  });

  test("renders the admin testimonials list", async () => {
    render(await AdminTestimonialsPage());

    expect(
      screen.getByRole("heading", { name: "Testimonials", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "New testimonial" })).toHaveAttribute(
      "href",
      "/admin/testimonials/new",
    );
    expect(screen.getByText("Maya Lee")).toBeInTheDocument();
    expect(screen.getByText("text · published · sort 1")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edit" })).toHaveAttribute(
      "href",
      "/admin/testimonials/testimonial-1/edit",
    );
  });

  test("renders the new testimonial form with text and video controls", async () => {
    render(await NewTestimonialPage());

    expect(
      screen.getByRole("heading", { name: "Create Testimonial", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Title or company")).toBeInTheDocument();
    expect(screen.getByLabelText("Quote")).toBeInTheDocument();
    expect(screen.getByLabelText("Type")).toBeInTheDocument();
    expect(screen.getByLabelText("Upload video")).toHaveAttribute(
      "accept",
      "video/mp4,video/webm,video/quicktime",
    );
  });

  test("renders the admin users page and creation form", async () => {
    render(await AdminUsersPage());

    expect(screen.getByRole("heading", { name: "Users", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("admin@example.com")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Initial password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create admin" })).toBeInTheDocument();
  });
});
