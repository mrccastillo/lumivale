import { afterEach, describe, expect, test } from "vitest";

afterEach(() => {
  delete process.env.TRUSTED_CLIENT_MAGIC_LINK_SECRET;
});

describe("client access verify route", () => {
  test("sets the trusted session cookie and redirects for a valid token", async () => {
    process.env.TRUSTED_CLIENT_MAGIC_LINK_SECRET = "super-secret";
    const { createMagicLinkToken } = await import("@/lib/trusted-client");
    const token = createMagicLinkToken("client@example.com");
    const { GET } = await import("@/app/client-access/verify/route");

    const response = await GET(
      new Request(`http://localhost/client-access/verify?token=${token}`),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("/pricing");
    expect(response.headers.get("set-cookie")).toContain("trusted_client=");
  });

  test("explains an invalid token without redirecting to the removed page", async () => {
    process.env.TRUSTED_CLIENT_MAGIC_LINK_SECRET = "super-secret";
    const { GET } = await import("@/app/client-access/verify/route");

    const response = await GET(
      new Request("http://localhost/client-access/verify?token=bad-token"),
    );

    expect(response.status).toBe(400);
    expect(response.headers.get("location")).toBeNull();
    expect(await response.text()).toContain("invalid or expired");
  });
});
