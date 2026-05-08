import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import ClientAccessPage from "@/app/client-access/page";

describe("client access page", () => {
  test("renders the email request form", async () => {
    const { container } = render(await ClientAccessPage({ searchParams: Promise.resolve({}) }));

    expect(
      screen.getByRole("heading", { name: "Client Access", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Send magic link" }),
    ).toBeInTheDocument();
    expect(container.querySelector("section")).toHaveClass("pt-32", "pb-[54px]");
    expect(container.querySelector("section")).not.toHaveClass("py-[54px]");
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

  test("shows contact admin message for unapproved emails", async () => {
    render(
      await ClientAccessPage({
        searchParams: Promise.resolve({
          error: "not-approved",
        }),
      }),
    );

    expect(
      screen.getByText(
        "This email is not approved for private pricing access. Contact the admin to be added as a trusted client.",
      ),
    ).toBeInTheDocument();
  });

  test("shows an SMTP failure message when sending fails", async () => {
    render(
      await ClientAccessPage({
        searchParams: Promise.resolve({
          error: "email-failed",
        }),
      }),
    );

    expect(
      screen.getByText(
        "We could not send the access email. Check the SMTP sender settings and try again.",
      ),
    ).toBeInTheDocument();
  });
});
