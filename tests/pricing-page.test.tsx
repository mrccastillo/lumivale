import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

const hasTrustedClientAccessMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/trusted-client", () => ({
  hasTrustedClientAccess: hasTrustedClientAccessMock,
}));

describe("pricing page", () => {
  test("renders private flat-rate growth package copy for trusted visitors", async () => {
    hasTrustedClientAccessMock.mockResolvedValue(true);
    const { default: PricingPage } = await import("@/app/pricing/page");

    render(await PricingPage());

    expect(screen.getByRole("heading", { name: "Pricing", level: 1 })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Private flat-rate growth packages for approved Lumivale clients.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Placeholder/i)).not.toBeInTheDocument();
  });
});
