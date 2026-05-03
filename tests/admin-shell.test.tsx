import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { AdminNav } from "@/app/admin/admin-nav";
import { AdminWorkspace } from "@/app/admin/admin-workspace";
import { AppShellClient } from "@/components/app-shell-client";

const pathnameMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", async () => {
  const actual = await vi.importActual<typeof import("next/navigation")>("next/navigation");

  return {
    ...actual,
    usePathname: pathnameMock,
  };
});

afterEach(() => {
  pathnameMock.mockReset();
});

describe("admin shell", () => {
  test("hides the public navbar and footer on admin routes", () => {
    pathnameMock.mockReturnValue("/admin/blogs");

    render(
      <AppShellClient
        footer={<footer>Public footer</footer>}
        navbar={<header>Public navbar</header>}
      >
        <p>Admin content</p>
      </AppShellClient>,
    );

    expect(screen.getByText("Admin content")).toBeInTheDocument();
    expect(screen.queryByText("Public navbar")).not.toBeInTheDocument();
    expect(screen.queryByText("Public footer")).not.toBeInTheDocument();
  });

  test("keeps the public navbar and footer on public routes", () => {
    pathnameMock.mockReturnValue("/blogs");

    render(
      <AppShellClient
        footer={<footer>Public footer</footer>}
        navbar={<header>Public navbar</header>}
      >
        <p>Public content</p>
      </AppShellClient>,
    );

    expect(screen.getByText("Public navbar")).toBeInTheDocument();
    expect(screen.getByText("Public content")).toBeInTheDocument();
    expect(screen.getByText("Public footer")).toBeInTheDocument();
  });

  test("renders a collapsible left sidebar admin navigation", () => {
    pathnameMock.mockReturnValue("/admin/blogs");

    render(<AdminNav />);

    expect(screen.getByRole("navigation", { name: "Admin navigation" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Blogs" })).toHaveAttribute(
      "href",
      "/admin/blogs",
    );
    expect(screen.getByRole("link", { name: "Testimonials" })).toHaveAttribute(
      "href",
      "/admin/testimonials",
    );
    expect(screen.getByRole("link", { name: "Users" })).toHaveAttribute(
      "href",
      "/admin/users",
    );
    expect(screen.getByRole("button", { name: "Collapse navigation" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("navigation", { name: "Admin navigation" })).toHaveClass(
      "left-0",
      "top-0",
      "h-screen",
    );

    fireEvent.click(screen.getByRole("button", { name: "Collapse navigation" }));

    expect(screen.getByRole("button", { name: "Expand navigation" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  test("wraps authenticated admin pages with sidebar and compact header", () => {
    pathnameMock.mockReturnValue("/admin/blogs");

    render(
      <AdminWorkspace>
        <p>Blog dashboard</p>
      </AdminWorkspace>,
    );

    expect(screen.getByRole("navigation", { name: "Admin navigation" })).toBeInTheDocument();
    expect(screen.getByRole("banner", { name: "Admin header" })).toBeInTheDocument();
    expect(screen.getByText("Blog dashboard")).toBeInTheDocument();
  });

  test("does not render sidebar or compact header on admin login", () => {
    pathnameMock.mockReturnValue("/admin/login");

    render(
      <AdminWorkspace>
        <p>Login form</p>
      </AdminWorkspace>,
    );

    expect(screen.getByText("Login form")).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Admin navigation" })).not.toBeInTheDocument();
    expect(screen.queryByRole("banner", { name: "Admin header" })).not.toBeInTheDocument();
  });
});
