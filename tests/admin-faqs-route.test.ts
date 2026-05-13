import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const requireAdminAccessMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    adminId: "admin-1",
    email: "admin@example.com",
  }),
);
const getMongoDbMock = vi.hoisted(() => vi.fn().mockResolvedValue("test-db"));
const createFaqMock = vi.hoisted(() => vi.fn());
const parseFaqFormDataMock = vi.hoisted(() => vi.fn());
const reorderFaqsMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/admin-auth", () => ({
  requireAdminAccess: requireAdminAccessMock,
}));

vi.mock("@/lib/mongodb", () => ({
  getMongoDb: getMongoDbMock,
}));

vi.mock("@/lib/faqs", () => ({
  createFaq: createFaqMock,
  parseFaqFormData: parseFaqFormDataMock,
  reorderFaqs: reorderFaqsMock,
}));

beforeEach(() => {
  parseFaqFormDataMock.mockReturnValue({
    question: "How soon can Lumivale start?",
    answer: "Most projects can begin after a short discovery call.",
    sortOrder: 1,
    status: "draft",
  });
  createFaqMock.mockResolvedValue({ id: "faq-1" });
  reorderFaqsMock.mockResolvedValue([]);
});

afterEach(() => {
  requireAdminAccessMock.mockClear();
  getMongoDbMock.mockClear();
  createFaqMock.mockReset();
  parseFaqFormDataMock.mockReset();
  reorderFaqsMock.mockReset();
});

describe("admin FAQs create route", () => {
  test("redirects back to the FAQ list after a successful create", async () => {
    const { POST } = await import("@/app/api/admin/faqs/route");

    const response = await POST(
      new Request("http://localhost/api/admin/faqs", {
        method: "POST",
        body: new FormData(),
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/admin/faqs");
    expect(createFaqMock).toHaveBeenCalledWith(
      "test-db",
      expect.objectContaining({ question: "How soon can Lumivale start?" }),
    );
  });

  test("reopens the create modal when FAQ validation fails", async () => {
    createFaqMock.mockRejectedValue(new Error("Question and answer are required."));
    const { POST } = await import("@/app/api/admin/faqs/route");

    const response = await POST(
      new Request("http://localhost/api/admin/faqs", {
        method: "POST",
        body: new FormData(),
      }),
    );
    const redirectUrl = new URL(response.headers.get("location")!, "http://localhost");

    expect(response.status).toBe(303);
    expect(redirectUrl.pathname).toBe("/admin/faqs");
    expect(redirectUrl.searchParams.get("mode")).toBe("create");
    expect(redirectUrl.searchParams.get("error")).toBe("Question and answer are required.");
  });
});

describe("admin FAQs reorder route", () => {
  test("persists FAQ order and redirects back to the dashboard", async () => {
    const { POST } = await import("@/app/api/admin/faqs/reorder/route");
    const formData = new FormData();

    formData.set("order", JSON.stringify(["faq-2", "faq-1", "faq-3"]));
    formData.set("redirectTo", "/admin/faqs?page=1");

    const response = await POST(
      new Request("http://localhost/api/admin/faqs/reorder", {
        method: "POST",
        body: formData,
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/admin/faqs?page=1");
    expect(reorderFaqsMock).toHaveBeenCalledWith("test-db", ["faq-2", "faq-1", "faq-3"]);
  });

  test("returns JSON for autosaved FAQ order", async () => {
    const { POST } = await import("@/app/api/admin/faqs/reorder/route");
    const formData = new FormData();

    formData.set("order", JSON.stringify(["faq-2", "faq-1"]));

    const response = await POST(
      new Request("http://localhost/api/admin/faqs/reorder", {
        method: "POST",
        body: formData,
        headers: {
          "X-FAQ-Reorder": "autosave",
        },
      }),
    );

    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(reorderFaqsMock).toHaveBeenCalledWith("test-db", ["faq-2", "faq-1"]);
  });
});
