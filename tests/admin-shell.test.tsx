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

    render(<AdminNav isDesktopExpanded={true} onDesktopToggle={() => {}} />);

    expect(screen.getByRole("navigation", { name: "Admin navigation" })).toBeInTheDocument();
    const blogsLink = screen.getByRole("link", { name: "Blogs" });

    expect(blogsLink).toHaveAttribute(
      "href",
      "/admin/blogs",
    );
    expect(blogsLink.querySelector("svg")).not.toBeNull();
    expect(screen.getByRole("link", { name: "Testimonials" })).toHaveAttribute(
      "href",
      "/admin/testimonials",
    );
    expect(screen.getByRole("link", { name: "Services" })).toHaveAttribute(
      "href",
      "/admin/services",
    );
    expect(screen.getByRole("link", { name: "Hero Clients" })).toHaveAttribute(
      "href",
      "/admin/hero-clients",
    );
    expect(screen.getByRole("link", { name: "FAQs" })).toHaveAttribute(
      "href",
      "/admin/faqs",
    );
    expect(screen.getByRole("link", { name: "Users" })).toHaveAttribute(
      "href",
      "/admin/users",
    );
    expect(screen.getByRole("link", { name: "Trusted Clients" })).toHaveAttribute(
      "href",
      "/admin/trusted-clients",
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

  test("hides the desktop logo block and reduces the workspace offset when collapsed", () => {
    pathnameMock.mockReturnValue("/admin/blogs");

    render(
      <AdminWorkspace>
        <p>Blog dashboard</p>
      </AdminWorkspace>,
    );

    const shell = screen.getByTestId("admin-workspace-shell");

    expect(shell).toHaveClass("md:pl-[17.5rem]");
    expect(screen.getByText("Lumivale")).toBeInTheDocument();
    expect(screen.getByText("Admin Portal")).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(8);

    fireEvent.click(screen.getByRole("button", { name: "Collapse navigation" }));

    expect(screen.getByRole("button", { name: "Expand navigation" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(shell).toHaveClass("md:pl-[5.5rem]");
    expect(screen.queryByText("Lumivale")).not.toBeInTheDocument();
    expect(screen.queryByText("Admin Portal")).not.toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(7);
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
