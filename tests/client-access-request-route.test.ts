import { afterEach, describe, expect, test, vi } from "vitest";

const getMongoDbMock = vi.hoisted(() => vi.fn().mockResolvedValue("test-db"));
const requireAdminAccessMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/admin-auth", () => ({ requireAdminAccess: requireAdminAccessMock }));
const hasTrustedClientApprovalMock = vi.hoisted(() => vi.fn());
const sendTrustedClientMagicLinkMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/mongodb", () => ({
  getMongoDb: getMongoDbMock,
}));

vi.mock("@/lib/trusted-clients", () => ({
  hasTrustedClientApproval: hasTrustedClientApprovalMock,
}));

vi.mock("@/lib/trusted-client-email", () => ({
  sendTrustedClientMagicLink: sendTrustedClientMagicLinkMock,
}));

afterEach(() => {
  delete process.env.TRUSTED_CLIENT_MAGIC_LINK_SECRET;
  getMongoDbMock.mockClear();
  hasTrustedClientApprovalMock.mockReset();
  sendTrustedClientMagicLinkMock.mockReset();
});

describe("admin magic link send route", () => {
  test("blocks unauthenticated requests before accessing data or sending email", async () => {
    requireAdminAccessMock.mockRejectedValueOnce(new Error("NEXT_REDIRECT"));
    const { POST } = await import("@/app/api/admin/trusted-clients/send-link/route");
    await expect(POST(new Request("http://localhost/api/admin/trusted-clients/send-link", { method: "POST" }))).rejects.toThrow("NEXT_REDIRECT");
    expect(getMongoDbMock).not.toHaveBeenCalled();
    expect(sendTrustedClientMagicLinkMock).not.toHaveBeenCalled();
  });
  test("sends a magic link for an approved email", async () => {
    process.env.TRUSTED_CLIENT_MAGIC_LINK_SECRET = "super-secret";
    hasTrustedClientApprovalMock.mockResolvedValue(true);
    sendTrustedClientMagicLinkMock.mockResolvedValue({ mode: "email" });

    const { POST } = await import("@/app/api/admin/trusted-clients/send-link/route");
    const formData = new FormData();
    formData.set("email", "Client@Example.com");

    const response = await POST(
      new Request("http://localhost/api/admin/trusted-clients/send-link", {
        method: "POST",
        body: formData,
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
    expect(await response.json()).toEqual({ mode: "email" });
    expect(hasTrustedClientApprovalMock).toHaveBeenCalledWith("test-db", "client@example.com");
    expect(sendTrustedClientMagicLinkMock).toHaveBeenCalledTimes(1);
    expect(sendTrustedClientMagicLinkMock.mock.calls[0]?.[0]).toMatchObject({
      email: "client@example.com",
    });
    expect(sendTrustedClientMagicLinkMock.mock.calls[0]?.[0].magicLink).toContain(
      "/client-access/verify?token=",
    );
  });

  test("returns an inline error for unapproved emails", async () => {
    process.env.TRUSTED_CLIENT_MAGIC_LINK_SECRET = "super-secret";
    hasTrustedClientApprovalMock.mockResolvedValue(false);

    const { POST } = await import("@/app/api/admin/trusted-clients/send-link/route");
    const formData = new FormData();
    formData.set("email", "other@example.com");

    const response = await POST(
      new Request("http://localhost/api/admin/trusted-clients/send-link", {
        method: "POST",
        body: formData,
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "This email is not approved for private pricing access." });
    expect(sendTrustedClientMagicLinkMock).not.toHaveBeenCalled();
  });

  test("shows a preview link in development when email transport is not configured", async () => {
    process.env.TRUSTED_CLIENT_MAGIC_LINK_SECRET = "super-secret";
    hasTrustedClientApprovalMock.mockResolvedValue(true);
    sendTrustedClientMagicLinkMock.mockResolvedValue({
      mode: "preview",
      previewUrl: "http://localhost/client-access/verify?token=preview-token",
    });

    const { POST } = await import("@/app/api/admin/trusted-clients/send-link/route");
    const formData = new FormData();
    formData.set("email", "client@example.com");

    const response = await POST(
      new Request("http://localhost/api/admin/trusted-clients/send-link", {
        method: "POST",
        body: formData,
      }),
    );

    expect(response.headers.get("location")).toBeNull();
    expect(await response.json()).toEqual({ mode: "preview", previewUrl: "http://localhost/client-access/verify?token=preview-token" });
  });

  test("returns an inline error when SMTP send fails", async () => {
    process.env.TRUSTED_CLIENT_MAGIC_LINK_SECRET = "super-secret";
    hasTrustedClientApprovalMock.mockResolvedValue(true);
    sendTrustedClientMagicLinkMock.mockRejectedValue(new Error("bad smtp sender"));

    const { POST } = await import("@/app/api/admin/trusted-clients/send-link/route");
    const formData = new FormData();
    formData.set("email", "client@example.com");

    const response = await POST(
      new Request("http://localhost/api/admin/trusted-clients/send-link", {
        method: "POST",
        body: formData,
      }),
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Could not send the magic link. Please try again." });
  });
});
