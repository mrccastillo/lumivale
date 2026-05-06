import { afterEach, describe, expect, test, vi } from "vitest";

const getMongoDbMock = vi.hoisted(() => vi.fn().mockResolvedValue("test-db"));
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

describe("client access request route", () => {
  test("sends a magic link for an approved email", async () => {
    process.env.TRUSTED_CLIENT_MAGIC_LINK_SECRET = "super-secret";
    hasTrustedClientApprovalMock.mockResolvedValue(true);
    sendTrustedClientMagicLinkMock.mockResolvedValue({ mode: "email" });

    const { POST } = await import("@/app/client-access/request/route");
    const formData = new FormData();
    formData.set("email", "Client@Example.com");

    const response = await POST(
      new Request("http://localhost/client-access/request", {
        method: "POST",
        body: formData,
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/client-access?sent=1");
    expect(hasTrustedClientApprovalMock).toHaveBeenCalledWith("test-db", "client@example.com");
    expect(sendTrustedClientMagicLinkMock).toHaveBeenCalledTimes(1);
    expect(sendTrustedClientMagicLinkMock.mock.calls[0]?.[0]).toMatchObject({
      email: "client@example.com",
    });
    expect(sendTrustedClientMagicLinkMock.mock.calls[0]?.[0].magicLink).toContain(
      "/client-access/verify?token=",
    );
  });

  test("does not send a magic link for an unapproved email", async () => {
    process.env.TRUSTED_CLIENT_MAGIC_LINK_SECRET = "super-secret";
    hasTrustedClientApprovalMock.mockResolvedValue(false);

    const { POST } = await import("@/app/client-access/request/route");
    const formData = new FormData();
    formData.set("email", "other@example.com");

    const response = await POST(
      new Request("http://localhost/client-access/request", {
        method: "POST",
        body: formData,
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/client-access?sent=1");
    expect(sendTrustedClientMagicLinkMock).not.toHaveBeenCalled();
  });

  test("shows a preview link in development when email transport is not configured", async () => {
    process.env.TRUSTED_CLIENT_MAGIC_LINK_SECRET = "super-secret";
    hasTrustedClientApprovalMock.mockResolvedValue(true);
    sendTrustedClientMagicLinkMock.mockResolvedValue({
      mode: "preview",
      previewUrl: "http://localhost/client-access/verify?token=preview-token",
    });

    const { POST } = await import("@/app/client-access/request/route");
    const formData = new FormData();
    formData.set("email", "client@example.com");

    const response = await POST(
      new Request("http://localhost/client-access/request", {
        method: "POST",
        body: formData,
      }),
    );

    expect(response.headers.get("location")).toBe(
      "/client-access?sent=1&preview=http%3A%2F%2Flocalhost%2Fclient-access%2Fverify%3Ftoken%3Dpreview-token",
    );
  });
});
