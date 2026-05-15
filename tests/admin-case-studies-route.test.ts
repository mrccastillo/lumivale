import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const requireAdminAccessMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    adminId: "admin-1",
    email: "admin@example.com",
  }),
);
const getMongoDbMock = vi.hoisted(() => vi.fn().mockResolvedValue("test-db"));
const createCaseStudyMock = vi.hoisted(() => vi.fn());
const updateCaseStudyMock = vi.hoisted(() => vi.fn());
const deleteCaseStudyMock = vi.hoisted(() => vi.fn());
const parseCaseStudyFormDataMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/admin-auth", () => ({
  requireAdminAccess: requireAdminAccessMock,
}));

vi.mock("@/lib/mongodb", () => ({
  getMongoDb: getMongoDbMock,
}));

vi.mock("@/lib/case-studies", () => ({
  createCaseStudy: createCaseStudyMock,
  deleteCaseStudy: deleteCaseStudyMock,
  parseCaseStudyFormData: parseCaseStudyFormDataMock,
  updateCaseStudy: updateCaseStudyMock,
}));

beforeEach(() => {
  parseCaseStudyFormDataMock.mockReturnValue({
    slug: "new-case-study",
    title: "New Case Study",
    category: "Awareness",
    headline: "150 qualified conversations",
    summary: "A short summary.",
    challenge: "The client needed more relevant awareness.",
    solution: "Lumivale built a focused conversation plan.",
    outcomes: ["Clearer channel focus"],
    metrics: [{ value: "150", label: "qualified conversations" }],
    sortOrder: 4,
    status: "draft",
  });
  createCaseStudyMock.mockResolvedValue({ slug: "new-case-study" });
  updateCaseStudyMock.mockResolvedValue({ slug: "comment-awareness-sprint" });
  deleteCaseStudyMock.mockResolvedValue(undefined);
});

afterEach(() => {
  requireAdminAccessMock.mockClear();
  getMongoDbMock.mockClear();
  createCaseStudyMock.mockReset();
  updateCaseStudyMock.mockReset();
  deleteCaseStudyMock.mockReset();
  parseCaseStudyFormDataMock.mockReset();
});

describe("admin case studies routes", () => {
  test("redirects to the edit page after creating a case study", async () => {
    const { POST } = await import("@/app/api/admin/case-studies/route");

    const response = await POST(
      new Request("http://localhost/api/admin/case-studies", {
        method: "POST",
        body: new FormData(),
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/admin/case-studies/new-case-study/edit");
    expect(createCaseStudyMock).toHaveBeenCalledWith(
      "test-db",
      expect.objectContaining({ title: "New Case Study" }),
    );
  });

  test("reopens the create panel when validation fails", async () => {
    createCaseStudyMock.mockRejectedValue(new Error("Add at least one complete metric."));
    const { POST } = await import("@/app/api/admin/case-studies/route");

    const response = await POST(
      new Request("http://localhost/api/admin/case-studies", {
        method: "POST",
        body: new FormData(),
      }),
    );
    const redirectUrl = new URL(response.headers.get("location")!, "http://localhost");

    expect(response.status).toBe(303);
    expect(redirectUrl.pathname).toBe("/admin/case-studies");
    expect(redirectUrl.searchParams.get("mode")).toBe("create");
    expect(redirectUrl.searchParams.get("error")).toBe("Add at least one complete metric.");
  });

  test("updates an existing case study from form data", async () => {
    const { POST } = await import("@/app/api/admin/case-studies/[slug]/route");

    const response = await POST(
      new Request("http://localhost/api/admin/case-studies/comment-awareness-sprint", {
        method: "POST",
        body: new FormData(),
      }),
      { params: Promise.resolve({ slug: "comment-awareness-sprint" }) },
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "/admin/case-studies/comment-awareness-sprint/edit",
    );
    expect(updateCaseStudyMock).toHaveBeenCalledWith(
      "test-db",
      "comment-awareness-sprint",
      expect.objectContaining({ title: "New Case Study" }),
    );
  });

  test("publishes and deletes case studies through action posts", async () => {
    const { POST } = await import("@/app/api/admin/case-studies/[slug]/route");
    const publishForm = new FormData();
    publishForm.set("action", "publish");

    const publishResponse = await POST(
      new Request("http://localhost/api/admin/case-studies/comment-awareness-sprint", {
        method: "POST",
        body: publishForm,
      }),
      { params: Promise.resolve({ slug: "comment-awareness-sprint" }) },
    );

    expect(publishResponse.headers.get("location")).toBe("/admin/case-studies");
    expect(updateCaseStudyMock).toHaveBeenCalledWith("test-db", "comment-awareness-sprint", {
      status: "published",
    });

    const deleteForm = new FormData();
    deleteForm.set("action", "delete");

    const deleteResponse = await POST(
      new Request("http://localhost/api/admin/case-studies/custom-story", {
        method: "POST",
        body: deleteForm,
      }),
      { params: Promise.resolve({ slug: "custom-story" }) },
    );

    expect(deleteResponse.headers.get("location")).toBe("/admin/case-studies");
    expect(deleteCaseStudyMock).toHaveBeenCalledWith("test-db", "custom-story");
  });
});
