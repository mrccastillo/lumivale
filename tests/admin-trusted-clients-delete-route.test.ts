import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const requireAdminAccessMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    adminId: "admin-1",
    email: "admin@example.com",
  }),
);
const getMongoDbMock = vi.hoisted(() => vi.fn().mockResolvedValue("test-db"));
const deleteTrustedClientMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/admin-auth", () => ({
  requireAdminAccess: requireAdminAccessMock,
}));

vi.mock("@/lib/mongodb", () => ({
  getMongoDb: getMongoDbMock,
}));

vi.mock("@/lib/trusted-clients", () => ({
  deleteTrustedClient: deleteTrustedClientMock,
}));

beforeEach(() => {
  deleteTrustedClientMock.mockResolvedValue(undefined);
});

afterEach(() => {
  requireAdminAccessMock.mockClear();
  getMongoDbMock.mockClear();
  deleteTrustedClientMock.mockReset();
});

describe("admin trusted clients delete route", () => {
  test("redirects back to the trusted clients page after remove", async () => {
    const { POST } = await import("@/app/api/admin/trusted-clients/[id]/route");

    const response = await POST(
      new Request("http://localhost/api/admin/trusted-clients/trusted-1", { method: "POST" }),
      { params: Promise.resolve({ id: "trusted-1" }) },
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/admin/trusted-clients?status=removed");
    expect(requireAdminAccessMock).toHaveBeenCalledTimes(1);
    expect(deleteTrustedClientMock).toHaveBeenCalledWith("test-db", "trusted-1");
  });

  test("redirects back with a generic error when remove fails", async () => {
    deleteTrustedClientMock.mockRejectedValue(new Error("Trusted client not found."));
    const { POST } = await import("@/app/api/admin/trusted-clients/[id]/route");

    const response = await POST(
      new Request("http://localhost/api/admin/trusted-clients/trusted-1", { method: "POST" }),
      { params: Promise.resolve({ id: "trusted-1" }) },
    );
    const redirectUrl = new URL(response.headers.get("location")!, "http://localhost");

    expect(response.status).toBe(303);
    expect(redirectUrl.pathname).toBe("/admin/trusted-clients");
    expect(redirectUrl.searchParams.get("error")).toBe("Could not remove trusted client.");
  });
});
