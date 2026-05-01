import { afterEach, describe, expect, test, vi } from "vitest";

const cookiesMock = vi.hoisted(() => vi.fn());

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

afterEach(() => {
  cookiesMock.mockReset();
  delete process.env.TRUSTED_CLIENT_MAGIC_LINK_SECRET;
});

describe("trusted client access", () => {
  test("returns false when the trusted cookie is absent", async () => {
    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    });

    const { hasTrustedClientAccess } = await import("@/lib/trusted-client");

    await expect(hasTrustedClientAccess()).resolves.toBe(false);
  });

  test("returns true when the trusted session cookie is valid", async () => {
    process.env.TRUSTED_CLIENT_MAGIC_LINK_SECRET = "super-secret";
    const { createTrustedClientSessionToken } = await import("@/lib/trusted-client");
    const token = createTrustedClientSessionToken("client@example.com");

    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: token }),
    });

    const { hasTrustedClientAccess } = await import("@/lib/trusted-client");

    await expect(hasTrustedClientAccess()).resolves.toBe(true);
  });

  test("returns false when the trusted session cookie is invalid", async () => {
    process.env.TRUSTED_CLIENT_MAGIC_LINK_SECRET = "super-secret";
    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "bad-token" }),
    });

    const { hasTrustedClientAccess } = await import("@/lib/trusted-client");

    await expect(hasTrustedClientAccess()).resolves.toBe(false);
  });
});
