import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const requireAdminAccessMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    adminId: "admin-1",
    email: "admin@example.com",
  }),
);
const getMongoDbMock = vi.hoisted(() => vi.fn().mockResolvedValue("test-db"));
const createHeroClientMock = vi.hoisted(() => vi.fn());
const deleteHeroClientMock = vi.hoisted(() => vi.fn());
const parseHeroClientFormDataMock = vi.hoisted(() => vi.fn());
const uploadCoverImageMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/admin-auth", () => ({
  requireAdminAccess: requireAdminAccessMock,
}));

vi.mock("@/lib/mongodb", () => ({
  getMongoDb: getMongoDbMock,
}));

vi.mock("@/lib/hero-clients", () => ({
  createHeroClient: createHeroClientMock,
  deleteHeroClient: deleteHeroClientMock,
  parseHeroClientFormData: parseHeroClientFormDataMock,
}));

vi.mock("@/app/api/admin/blogs/upload-cover", () => ({
  uploadCoverImage: uploadCoverImageMock,
}));

beforeEach(() => {
  parseHeroClientFormDataMock.mockReturnValue({
    clientName: "Northstar",
    logoUrl: "https://example.com/northstar.svg",
  });
  createHeroClientMock.mockResolvedValue({ id: "hero-client-1" });
  deleteHeroClientMock.mockResolvedValue(undefined);
  uploadCoverImageMock.mockResolvedValue("https://res.cloudinary.com/demo/image/upload/logo.png");
});

afterEach(() => {
  requireAdminAccessMock.mockClear();
  getMongoDbMock.mockClear();
  createHeroClientMock.mockReset();
  deleteHeroClientMock.mockReset();
  parseHeroClientFormDataMock.mockReset();
  uploadCoverImageMock.mockReset();
});

describe("admin hero clients create route", () => {
  test("redirects back to the hero clients page after create", async () => {
    const { POST } = await import("@/app/api/admin/hero-clients/route");

    const response = await POST(
      new Request("http://localhost/api/admin/hero-clients", {
        method: "POST",
        body: new FormData(),
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/admin/hero-clients?status=created");
    expect(uploadCoverImageMock).toHaveBeenCalledWith(null);
    expect(createHeroClientMock).toHaveBeenCalledWith(
      "test-db",
      expect.objectContaining({ clientName: "Northstar" }),
    );
  });

  test("redirects back with an error when create fails", async () => {
    createHeroClientMock.mockRejectedValue(
      new Error("Client name and logo URL are required."),
    );
    const { POST } = await import("@/app/api/admin/hero-clients/route");

    const response = await POST(
      new Request("http://localhost/api/admin/hero-clients", {
        method: "POST",
        body: new FormData(),
      }),
    );
    const redirectUrl = new URL(response.headers.get("location")!, "http://localhost");

    expect(response.status).toBe(303);
    expect(redirectUrl.pathname).toBe("/admin/hero-clients");
    expect(redirectUrl.searchParams.get("error")).toBe(
      "Client name and logo URL are required.",
    );
  });
});

describe("admin hero clients delete route", () => {
  test("redirects back to the hero clients page after remove", async () => {
    const { POST } = await import("@/app/api/admin/hero-clients/[id]/route");

    const response = await POST(
      new Request("http://localhost/api/admin/hero-clients/hero-client-1", {
        method: "POST",
      }),
      { params: Promise.resolve({ id: "hero-client-1" }) },
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/admin/hero-clients?status=removed");
    expect(deleteHeroClientMock).toHaveBeenCalledWith("test-db", "hero-client-1");
  });
});
