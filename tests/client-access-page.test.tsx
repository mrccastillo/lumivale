import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import ClientAccessPage from "@/app/client-access/page";

describe("client access page", () => {
  test("renders the email request form", async () => {
    render(await ClientAccessPage({ searchParams: Promise.resolve({}) }));

    expect(
      screen.getByRole("heading", { name: "Client Access", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Send magic link" }),
    ).toBeInTheDocument();
  });

  test("shows the development preview link when present", async () => {
    render(
      await ClientAccessPage({
        searchParams: Promise.resolve({
          sent: "1",
          preview: "http://localhost/client-access/verify?token=preview-token",
        }),
      }),
    );

    expect(screen.getByRole("link", { name: "Open preview magic link" })).toHaveAttribute(
      "href",
      "http://localhost/client-access/verify?token=preview-token",
    );
  });
});
