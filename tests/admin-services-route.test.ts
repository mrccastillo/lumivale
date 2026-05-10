import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const requireAdminAccessMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    adminId: "admin-1",
    email: "admin@example.com",
  }),
);
const getMongoDbMock = vi.hoisted(() => vi.fn().mockResolvedValue("test-db"));
const createServiceMock = vi.hoisted(() => vi.fn());
const updateServiceMock = vi.hoisted(() => vi.fn());
const deleteServiceMock = vi.hoisted(() => vi.fn());
const parseServiceFormDataMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/admin-auth", () => ({
  requireAdminAccess: requireAdminAccessMock,
}));

vi.mock("@/lib/mongodb", () => ({
  getMongoDb: getMongoDbMock,
}));

vi.mock("@/lib/services", () => ({
  createService: createServiceMock,
  deleteService: deleteServiceMock,
  parseServiceFormData: parseServiceFormDataMock,
  updateService: updateServiceMock,
}));

beforeEach(() => {
  parseServiceFormDataMock.mockReturnValue({
    title: "New Service",
    summary: "Summary",
    description: "Description",
    highlights: ["Highlight"],
    sortOrder: 1,
    status: "draft",
    privateContent: {
      exampleCards: [],
      examplePlatform: "Reddit",
      heroDescription: "Private detail",
      pricePreview: "$850/mo",
      pricingLines: [{ label: "Monthly rate", value: "$850" }],
    },
  });
  createServiceMock.mockResolvedValue({ slug: "new-service" });
  updateServiceMock.mockResolvedValue({ slug: "comment-campaign" });
  deleteServiceMock.mockResolvedValue(undefined);
});

afterEach(() => {
  requireAdminAccessMock.mockClear();
  getMongoDbMock.mockClear();
  createServiceMock.mockReset();
  updateServiceMock.mockReset();
  deleteServiceMock.mockReset();
  parseServiceFormDataMock.mockReset();
});

describe("admin services routes", () => {
  test("redirects to the edit page after creating a service", async () => {
    const { POST } = await import("@/app/api/admin/services/route");

    const response = await POST(
      new Request("http://localhost/api/admin/services", {
        method: "POST",
        body: new FormData(),
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/admin/services/new-service/edit");
    expect(createServiceMock).toHaveBeenCalledWith(
      "test-db",
      expect.objectContaining({ title: "New Service" }),
    );
  });

  test("reopens the create modal when service validation fails", async () => {
    createServiceMock.mockRejectedValue(new Error("Add at least one complete pricing line."));
    const { POST } = await import("@/app/api/admin/services/route");

    const response = await POST(
      new Request("http://localhost/api/admin/services", {
        method: "POST",
        body: new FormData(),
      }),
    );
    const redirectUrl = new URL(response.headers.get("location")!, "http://localhost");

    expect(response.status).toBe(303);
    expect(redirectUrl.pathname).toBe("/admin/services");
    expect(redirectUrl.searchParams.get("mode")).toBe("create");
    expect(redirectUrl.searchParams.get("error")).toBe(
      "Add at least one complete pricing line.",
    );
  });

  test("updates an existing service from form data", async () => {
    const { POST } = await import("@/app/api/admin/services/[slug]/route");

    const response = await POST(
      new Request("http://localhost/api/admin/services/comment-campaign", {
        method: "POST",
        body: new FormData(),
      }),
      { params: Promise.resolve({ slug: "comment-campaign" }) },
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/admin/services/comment-campaign/edit");
    expect(updateServiceMock).toHaveBeenCalledWith(
      "test-db",
      "comment-campaign",
      expect.objectContaining({ title: "New Service" }),
    );
  });

  test("publishes and deletes services through action posts", async () => {
    const { POST } = await import("@/app/api/admin/services/[slug]/route");
    const publishForm = new FormData();
    publishForm.set("action", "publish");

    const publishResponse = await POST(
      new Request("http://localhost/api/admin/services/comment-campaign", {
        method: "POST",
        body: publishForm,
      }),
      { params: Promise.resolve({ slug: "comment-campaign" }) },
    );

    expect(publishResponse.headers.get("location")).toBe("/admin/services");
    expect(updateServiceMock).toHaveBeenCalledWith("test-db", "comment-campaign", {
      status: "published",
    });

    const deleteForm = new FormData();
    deleteForm.set("action", "delete");

    const deleteResponse = await POST(
      new Request("http://localhost/api/admin/services/custom-service", {
        method: "POST",
        body: deleteForm,
      }),
      { params: Promise.resolve({ slug: "custom-service" }) },
    );

    expect(deleteResponse.headers.get("location")).toBe("/admin/services");
    expect(deleteServiceMock).toHaveBeenCalledWith("test-db", "custom-service");
  });
});
