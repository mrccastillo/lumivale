import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import AdminLoginPage from "@/app/admin/login/page";
import AdminCaseStudiesPage from "@/app/admin/case-studies/page";
import AdminFaqsPage from "@/app/admin/faqs/page";
import AdminHeroClientsPage from "@/app/admin/hero-clients/page";
import AdminServicesPage from "@/app/admin/services/page";
import AdminTestimonialsPage from "@/app/admin/testimonials/page";
import AdminTrustedClientsPage from "@/app/admin/trusted-clients/page";
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
      videoUrl: "",
      createdAt: new Date("2026-05-03T08:00:00.000Z"),
      updatedAt: new Date("2026-05-03T08:00:00.000Z"),
    },
  ]),
}));

vi.mock("@/lib/faqs", () => ({
  getAdminFaqs: vi.fn().mockResolvedValue([
    {
      id: "faq-1",
      question: "How soon can Lumivale start?",
      answer: "Most projects can begin after a short discovery call.",
      sortOrder: 1,
      status: "published",
      createdAt: new Date("2026-05-03T08:00:00.000Z"),
      updatedAt: new Date("2026-05-03T08:00:00.000Z"),
    },
  ]),
}));

vi.mock("@/lib/services", () => ({
  getAdminServices: vi.fn().mockResolvedValue([
    {
      slug: "comment-campaign",
      title: "Comment Campaign",
      summary: "Post targeted comments on relevant threads.",
      highlights: ["Relevant conversations"],
      description: "Posting targeted comments to increase awareness.",
      sortOrder: 1,
      status: "published",
      isDefault: true,
      createdAt: new Date("2026-05-03T08:00:00.000Z"),
      updatedAt: new Date("2026-05-03T08:00:00.000Z"),
      privateContent: {
        exampleCards: [],
        examplePlatform: "Reddit",
        heroDescription: "Private comment campaign detail.",
        pricePreview: "Starting at $850/mo",
        pricingLines: [{ label: "Monthly rate", value: "$850" }],
      },
    },
  ]),
}));

vi.mock("@/lib/case-studies", () => ({
  getAdminCaseStudies: vi.fn().mockResolvedValue([
    {
      slug: "comment-awareness-sprint",
      title: "Comment Awareness Sprint",
      category: "Awareness",
      headline: "100-140 targeted comments per month",
      summary: "A focused comment campaign built for relevant conversations.",
      challenge: "The brand needed early awareness.",
      solution: "Lumivale mapped relevant threads.",
      outcomes: ["Clearer channel focus"],
      metrics: [{ value: "100-140", label: "comments per month" }],
      sortOrder: 1,
      status: "published",
      isDefault: true,
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

vi.mock("@/lib/trusted-clients", () => ({
  getTrustedClients: vi.fn().mockResolvedValue([
    {
      id: "trusted-1",
      email: "client@example.com",
      createdAt: new Date("2026-05-06T08:00:00.000Z"),
      updatedAt: new Date("2026-05-06T08:00:00.000Z"),
    },
  ]),
}));

vi.mock("@/lib/hero-clients", () => ({
  getHeroClients: vi.fn().mockResolvedValue([
    {
      id: "hero-client-1",
      clientName: "Northstar",
      logoUrl: "https://example.com/northstar.svg",
      createdAt: new Date("2026-05-06T08:00:00.000Z"),
      updatedAt: new Date("2026-05-06T08:00:00.000Z"),
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
    render(await AdminTestimonialsPage({ searchParams: Promise.resolve({}) }));

    expect(
      screen.getByRole("heading", { name: "Testimonials", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Content Management")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "New testimonial" })).toHaveAttribute(
      "href",
      "/admin/testimonials?mode=create",
    );
    expect(screen.getByText("Maya Lee")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edit" })).toHaveAttribute(
      "href",
      "/admin/testimonials/testimonial-1/edit",
    );
  });

  test("renders the admin FAQ list", async () => {
    render(await AdminFaqsPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { name: "FAQs", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Content Management")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "New FAQ" })).toHaveAttribute(
      "href",
      "/admin/faqs?mode=create",
    );
    expect(screen.getByText("How soon can Lumivale start?")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edit" })).toHaveAttribute(
      "href",
      "/admin/faqs/faq-1/edit",
    );
  });

  test("renders the admin services list", async () => {
    render(await AdminServicesPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { name: "Services", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Service Management")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "New Service" })).toHaveAttribute(
      "href",
      "/admin/services?mode=create",
    );
    expect(screen.getByRole("heading", { name: "Comment Campaign", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edit" })).toHaveAttribute(
      "href",
      "/admin/services/comment-campaign/edit",
    );
  });

  test("renders the admin case studies list", async () => {
    render(await AdminCaseStudiesPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { name: "Case Studies", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Story Management")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "New Case Study" })).toHaveAttribute(
      "href",
      "/admin/case-studies?mode=create",
    );
    expect(
      screen.getByRole("heading", { name: "Comment Awareness Sprint", level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edit" })).toHaveAttribute(
      "href",
      "/admin/case-studies/comment-awareness-sprint/edit",
    );
  });

  test("renders the admin users page and creation form", async () => {
    render(await AdminUsersPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { name: "Users", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Admin Directory")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "admin@example.com", level: 3 })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Initial password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create admin" })).toBeInTheDocument();
  });

  test("renders the admin trusted clients page and creation form", async () => {
    render(await AdminTrustedClientsPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { name: "Trusted Clients", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Pricing Access")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "client@example.com", level: 3 })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add trusted client" })).toBeInTheDocument();
  });

  test("renders the admin hero clients page and creation form", async () => {
    render(await AdminHeroClientsPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { name: "Hero Clients", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Homepage Content")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Northstar", level: 3 })).toBeInTheDocument();
    expect(screen.getByLabelText("Client name")).toBeInTheDocument();
    expect(screen.getByLabelText("Client logo")).toHaveAttribute(
      "accept",
      "image/png,image/jpeg,image/webp,image/gif",
    );
    expect(screen.getByRole("button", { name: "Add hero client" })).toBeInTheDocument();
  });
});
