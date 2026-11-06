import { afterEach, expect, test, vi } from "vitest";
import { uploadTestimonialMedia } from "@/app/admin/testimonials/upload-media";

afterEach(() => vi.unstubAllGlobals());

test("sends video bytes to Cloudinary and only metadata to the signing endpoint", async () => {
  const file = new File(["video"], "client.mp4", { type: "video/mp4" });
  const fetchMock = vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({
      apiKey: "public-key", timestamp: 123, signature: "signed", folder: "lumivale/testimonials",
      uploadUrl: "https://api.cloudinary.com/v1_1/test/video/upload",
    }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ secure_url: "https://res.cloudinary.com/test/video/upload/client.mp4" }) });
  vi.stubGlobal("fetch", fetchMock);
  await expect(uploadTestimonialMedia(file, "video")).resolves.toContain("client.mp4");
  expect(fetchMock.mock.calls[0][1].body).toBe(JSON.stringify({ resourceType: "video" }));
  expect(fetchMock.mock.calls[1][0]).toBe("https://api.cloudinary.com/v1_1/test/video/upload");
  expect(fetchMock.mock.calls[1][1].body.get("file")).toBe(file);
});

test("rejects oversized videos before making a request", async () => {
  const fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  const file = new File(["video"], "client.mp4", { type: "video/mp4" });
  Object.defineProperty(file, "size", { value: 51 * 1024 * 1024 });
  await expect(uploadTestimonialMedia(file, "video")).rejects.toThrow("50MB");
  expect(fetchMock).not.toHaveBeenCalled();
});

test("reports failed uploads so the form can be retried", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
  await expect(uploadTestimonialMedia(new File(["video"], "a.mp4", { type: "video/mp4" }), "video"))
    .rejects.toThrow("Could not prepare upload");
});
