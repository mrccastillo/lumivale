import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import AdminLoginPage from "@/app/admin/login/page";
import { getSiteContentForSite } from "@/lib/site-content";
import { defaultSiteContent } from "@/lib/site-content-defaults";

vi.mock("@/lib/site-content", () => ({ getSiteContentForSite: vi.fn(async () => (await import("@/lib/site-content-defaults")).defaultSiteContent) }));

test("uses saved branding and picks up a changed logo on the next render", async () => {
  for (const logoUrl of ["https://example.com/first.png", "https://example.com/replacement.png"]) {
    vi.mocked(getSiteContentForSite).mockResolvedValueOnce({ ...defaultSiteContent, brandName: "Northstar", logoUrl });
    const { unmount } = render(await AdminLoginPage({ searchParams: {} }));
    expect(screen.getByRole("link", { name: "Northstar home" }).querySelector("img")).toHaveAttribute("src", logoUrl);
    unmount();
  }
});

test("uses the saved letter mark when no logo image is configured", async () => {
  vi.mocked(getSiteContentForSite).mockResolvedValueOnce({ ...defaultSiteContent, logoUrl: "", logoText: "NS", brandName: "Northstar" });
  render(await AdminLoginPage({ searchParams: {} }));
  const brand = screen.getByRole("link", { name: "Northstar home" });
  expect(brand).toHaveTextContent("NS");
  expect(brand.querySelector("img")).toBeNull();
});

test("preserves native login submission and password-manager fields", async () => {
  const { container } = render(await AdminLoginPage({ searchParams: Promise.resolve({}) }));
  expect(container.querySelector("form")).toHaveAttribute("action", "/api/admin/login");
  expect(container.querySelector("form")).toHaveAttribute("method", "post");
  expect(screen.getByLabelText("Email")).toHaveAttribute("autocomplete", "username");
  expect(screen.getByLabelText("Password")).toHaveAttribute("autocomplete", "current-password");
  expect(screen.getByLabelText("Email")).toBeRequired();
  expect(screen.getByLabelText("Password")).toBeRequired();
  expect(screen.queryByRole("alert")).toBeNull();
});

test("reveals and conceals the password without changing its value", async () => {
  render(await AdminLoginPage({ searchParams: {} }));
  const password = screen.getByLabelText("Password");
  fireEvent.change(password, { target: { value: "example-for-test" } });
  fireEvent.click(screen.getByRole("button", { name: "Show password" }));
  expect(password).toHaveAttribute("type", "text");
  expect(password).toHaveValue("example-for-test");
  expect(screen.getByRole("button", { name: "Hide password" })).toHaveAttribute("type", "button");
  fireEvent.click(screen.getByRole("button", { name: "Hide password" }));
  expect(password).toHaveAttribute("type", "password");
});

test("displays generic invalid-credentials feedback from the existing login redirect", async () => {
  render(await AdminLoginPage({ searchParams: Promise.resolve({ error: "invalid" }) }));
  expect(screen.getByRole("alert")).toHaveTextContent("The email or password is incorrect.");
  expect(screen.getByRole("link", { name: /Back to website/ })).toHaveAttribute("href", "/");
});
