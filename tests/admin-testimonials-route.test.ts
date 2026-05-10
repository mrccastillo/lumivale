import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const requireAdminAccessMock = vi.hoisted(() => vi.fn().mockResolvedValue({
  adminId: "admin-1",
  email: "admin@example.com",
}));
const getMongoDbMock = vi.hoisted(() => vi.fn().mockResolvedValue("test-db"));
const uploadTestimonialVideoMock = vi.hoisted(() => vi.fn());
const createTestimonialMock = vi.hoisted(() => vi.fn());
const parseTestimonialFormDataMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/admin-auth", () => ({
  requireAdminAccess: requireAdminAccessMock,
}));

vi.mock("@/lib/mongodb", () => ({
  getMongoDb: getMongoDbMock,
}));

vi.mock("@/app/api/admin/testimonials/upload-video", () => ({
  uploadTestimonialVideo: uploadTestimonialVideoMock,
}));

vi.mock("@/lib/testimonials", () => ({
  createTestimonial: createTestimonialMock,
  parseTestimonialFormData: parseTestimonialFormDataMock,
}));

beforeEach(() => {
  parseTestimonialFormDataMock.mockReturnValue({
    personName: "Maya Lee",
    personTitle: "Founder",
    quote: "A strong result.",
    sortOrder: 1,
    status: "draft",
    type: "video",
    videoUrl: "",
  });
  uploadTestimonialVideoMock.mockResolvedValue(
    "https://res.cloudinary.com/demo/video/upload/video-1.mp4",
  );
  createTestimonialMock.mockResolvedValue({ id: "testimonial-1" });
});

afterEach(() => {
  requireAdminAccessMock.mockClear();
  getMongoDbMock.mockClear();
  uploadTestimonialVideoMock.mockReset();
  createTestimonialMock.mockReset();
  parseTestimonialFormDataMock.mockReset();
});

describe("admin testimonials create route", () => {
  test("redirects back to the testimonials list after a successful create", async () => {
    const { POST } = await import("@/app/api/admin/testimonials/route");
    const formData = new FormData();
    formData.set("type", "video");

    const response = await POST(
      new Request("http://localhost/api/admin/testimonials", {
        method: "POST",
        body: formData,
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/admin/testimonials");
    expect(createTestimonialMock).toHaveBeenCalledWith(
      "test-db",
      expect.objectContaining({
        videoUrl: "https://res.cloudinary.com/demo/video/upload/video-1.mp4",
      }),
    );
  });

  test("reopens the create modal when the uploaded video is invalid", async () => {
    uploadTestimonialVideoMock.mockRejectedValue(
      new Error("Testimonial video must be 50MB or smaller."),
    );
    const { POST } = await import("@/app/api/admin/testimonials/route");

    const response = await POST(
      new Request("http://localhost/api/admin/testimonials", {
        method: "POST",
        body: new FormData(),
      }),
    );
    const redirectUrl = new URL(response.headers.get("location")!, "http://localhost");

    expect(response.status).toBe(303);
    expect(redirectUrl.pathname).toBe("/admin/testimonials");
    expect(redirectUrl.searchParams.get("mode")).toBe("create");
    expect(redirectUrl.searchParams.get("error")).toBe(
      "Testimonial video must be 50MB or smaller.",
    );
  });

  test("reopens the create modal when testimonial validation fails", async () => {
    createTestimonialMock.mockRejectedValue(
      new Error("Video testimonials require a video file."),
    );
    const { POST } = await import("@/app/api/admin/testimonials/route");

    const response = await POST(
      new Request("http://localhost/api/admin/testimonials", {
        method: "POST",
        body: new FormData(),
      }),
    );
    const redirectUrl = new URL(response.headers.get("location")!, "http://localhost");

    expect(response.status).toBe(303);
    expect(redirectUrl.pathname).toBe("/admin/testimonials");
    expect(redirectUrl.searchParams.get("mode")).toBe("create");
    expect(redirectUrl.searchParams.get("error")).toBe(
      "Video testimonials require a video file.",
    );
  });
});
