import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const requireAdminAccessMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    adminId: "admin-1",
    email: "admin@example.com",
  }),
);
const getMongoDbMock = vi.hoisted(() => vi.fn().mockResolvedValue("test-db"));
const createTrustedClientMock = vi.hoisted(() => vi.fn());
const parseTrustedClientFormDataMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/admin-auth", () => ({
  requireAdminAccess: requireAdminAccessMock,
}));

vi.mock("@/lib/mongodb", () => ({
  getMongoDb: getMongoDbMock,
}));

vi.mock("@/lib/trusted-clients", () => ({
  createTrustedClient: createTrustedClientMock,
  parseTrustedClientFormData: parseTrustedClientFormDataMock,
}));

beforeEach(() => {
  parseTrustedClientFormDataMock.mockReturnValue({
    email: "client@example.com",
  });
  createTrustedClientMock.mockResolvedValue({ id: "trusted-1" });
});

afterEach(() => {
  requireAdminAccessMock.mockClear();
  getMongoDbMock.mockClear();
  createTrustedClientMock.mockReset();
  parseTrustedClientFormDataMock.mockReset();
});

describe("admin trusted clients create route", () => {
  test("redirects back to the trusted clients page after create", async () => {
    const { POST } = await import("@/app/api/admin/trusted-clients/route");

    const response = await POST(
      new Request("http://localhost/api/admin/trusted-clients", {
        method: "POST",
        body: new FormData(),
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/admin/trusted-clients?status=created");
    expect(requireAdminAccessMock).toHaveBeenCalledTimes(1);
    expect(createTrustedClientMock).toHaveBeenCalledWith(
      "test-db",
      expect.objectContaining({ email: "client@example.com" }),
    );
  });

  test("redirects back with an error when create fails", async () => {
    createTrustedClientMock.mockRejectedValue(
      new Error("A trusted client with this email already exists."),
    );
    const { POST } = await import("@/app/api/admin/trusted-clients/route");

    const response = await POST(
      new Request("http://localhost/api/admin/trusted-clients", {
        method: "POST",
        body: new FormData(),
      }),
    );
    const redirectUrl = new URL(response.headers.get("location")!, "http://localhost");

    expect(response.status).toBe(303);
    expect(redirectUrl.pathname).toBe("/admin/trusted-clients");
    expect(redirectUrl.searchParams.get("error")).toBe(
      "A trusted client with this email already exists.",
    );
  });
});
