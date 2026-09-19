import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, afterEach, expect, test, vi } from "vitest";
import type { Db } from "mongodb";
import { defaultSiteContent } from "@/lib/site-content-defaults";
import { getSiteContent, getSiteContentForSite, parseSiteContent, saveSiteContent } from "@/lib/site-content";
import { POST } from "@/app/api/admin/site-content/route";
import { SiteContentForm } from "@/app/admin/site-content/site-content-form";
import { SiteNavbarClient } from "@/components/site-navbar-client";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(), db: vi.fn(), upload: vi.fn(), revalidate: vi.fn(), refresh: vi.fn(),
}));
vi.mock("@/lib/admin-auth", () => ({ requireAdminAccess: mocks.auth }));
vi.mock("@/lib/mongodb", () => ({ getMongoDb: mocks.db }));
vi.mock("@/lib/cloudinary", () => ({ uploadMediaToCloudinary: mocks.upload }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("next/navigation", () => ({ usePathname: () => "/", useRouter: () => ({ refresh: mocks.refresh }) }));

const findOne = vi.fn();
const updateOne = vi.fn();
const db = { collection: vi.fn(() => ({ findOne, updateOne })) } as unknown as Db;
beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.mockResolvedValue({ adminId: "admin" });
  mocks.db.mockResolvedValue(db);
  mocks.upload.mockResolvedValue("https://example.com/uploaded.png");
  findOne.mockResolvedValue(null);
  updateOne.mockResolvedValue({ acknowledged: true });
});
afterEach(() => vi.unstubAllGlobals());

function request(overrides = {}, file?: File) {
  const data = new FormData();
  Object.entries({ ...defaultSiteContent, ...overrides }).forEach(([key, value]) => data.set(key, value));
  if (file) data.set("logoFile", file);
  return { formData: async () => data } as Request;
}

test("defaults preserve the original homepage until settings are saved", async () => {
  expect(await getSiteContent(db)).toEqual(defaultSiteContent);
  findOne.mockResolvedValue({ brandName: "New Brand", heroHighlight: "" });
  expect(await getSiteContent(db)).toEqual({ ...defaultSiteContent, brandName: "New Brand", heroHighlight: "" });
  mocks.db.mockRejectedValueOnce(new Error("offline"));
  expect(await getSiteContentForSite()).toEqual(defaultSiteContent);
});

test("settings update one persistent document and support logo removal", async () => {
  await saveSiteContent(db, { ...defaultSiteContent, brandName: " New Brand ", logoUrl: "" });
  expect(updateOne).toHaveBeenCalledWith({ _id: "main" }, {
    $set: expect.objectContaining({ brandName: "New Brand", logoUrl: "", updatedAt: expect.any(Date) }),
  }, { upsert: true });
});

test("rejects unsafe destinations and missing required content", () => {
  expect(() => parseSiteContent({ ...defaultSiteContent, heroButtonUrl: "javascript:alert(1)" })).toThrow("HTTP");
  expect(() => parseSiteContent({ ...defaultSiteContent, logoUrl: "data:image/png;base64,abc" })).toThrow("HTTP");
  expect(() => parseSiteContent({ ...defaultSiteContent, brandName: " " })).toThrow("Complete");
  expect(() => parseSiteContent({ ...defaultSiteContent, resultsHeading: " " })).toThrow("Complete");
  expect(() => parseSiteContent({ ...defaultSiteContent, resultsMetric1Value: "1".repeat(25) })).toThrow("24 characters");
  expect(() => parseSiteContent({ ...defaultSiteContent, footerCtaButtonUrl: "javascript:alert(1)" })).toThrow("HTTP");
  expect(() => parseSiteContent({ ...defaultSiteContent, footerHomeUrl: "//example.com" })).toThrow("HTTP");
  expect(() => parseSiteContent({ ...defaultSiteContent, footerEmail: "invalid" })).toThrow("email");
  expect(parseSiteContent({ ...defaultSiteContent, footerHomeUrl: "/services" }).footerHomeUrl).toBe("/services");
});

test("authenticated saves upload the logo and refresh public routes", async () => {
  const response = await POST(request({ heroHeading: "New heading", footerTagline: "New tagline", footerCtaHeading: "Grow with us", resultsMetric1Value: "250K+", resultsMetric1Label: "People reached" }, new File(["image"], "logo.png", { type: "image/png" })));
  expect(response.status).toBe(200);
  expect(mocks.auth).toHaveBeenCalledOnce();
  expect(mocks.upload).toHaveBeenCalledWith(expect.any(File), { folder: "lumivale/branding", resourceType: "image" });
  expect(updateOne).toHaveBeenCalledWith({ _id: "main" }, { $set: expect.objectContaining({
    heroHeading: "New heading", logoUrl: "https://example.com/uploaded.png", footerTagline: "New tagline", footerCtaHeading: "Grow with us", resultsMetric1Value: "250K+", resultsMetric1Label: "People reached",
  }) }, { upsert: true });
  expect(mocks.revalidate).toHaveBeenCalledWith("/", "layout");
});

test("unauthenticated requests cannot upload or save", async () => {
  mocks.auth.mockRejectedValueOnce(new Error("unauthorized"));
  await expect(POST(request())).rejects.toThrow("unauthorized");
  expect(mocks.upload).not.toHaveBeenCalled();
  expect(updateOne).not.toHaveBeenCalled();
});

test.each([
  new File(["bad"], "logo.svg", { type: "image/svg+xml" }),
  new File([new Uint8Array(5 * 1024 * 1024 + 1)], "logo.png", { type: "image/png" }),
])("invalid logo files cannot change saved settings", async (file) => {
  const response = await POST(request({}, file));
  expect(response.status).toBe(400);
  expect(mocks.upload).not.toHaveBeenCalled();
  expect(updateOne).not.toHaveBeenCalled();
  expect(mocks.revalidate).not.toHaveBeenCalled();
});

test("failed persistence reports failure", async () => {
  updateOne.mockRejectedValueOnce(new Error("Save failed"));
  const response = await POST(request());
  expect(response.status).toBe(400);
  expect(await response.json()).toEqual({ error: "Save failed" });
  expect(mocks.revalidate).not.toHaveBeenCalled();
});

test("navbar uses the saved name and logo, with a letter fallback", () => {
  const props = { calendlyUrl: defaultSiteContent.heroButtonUrl, hasTrustedAccess: false, publicLinks: [] };
  const { container, rerender } = render(<SiteNavbarClient {...props} content={{ ...defaultSiteContent, brandName: "New Brand", logoUrl: "https://example.com/logo.png" }} />);
  expect(screen.getByRole("link", { name: "New Brand" })).toHaveAttribute("href", "/");
  expect(container.querySelector("img")).toHaveAttribute("src", "https://example.com/logo.png");
  rerender(<SiteNavbarClient {...props} content={{ ...defaultSiteContent, logoText: "N" }} />);
  expect(container.querySelector("img")).toBeNull();
  expect(screen.getByText("N")).toBeInTheDocument();
});

test("admin edits and logo removal are submitted and remain visible after save", async () => {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ content: { ...defaultSiteContent, brandName: "New Brand" } }) });
  vi.stubGlobal("fetch", fetchMock);
  render(<SiteContentForm initialContent={{ ...defaultSiteContent, logoUrl: "https://example.com/old.png" }} />);
  fireEvent.change(screen.getByLabelText("Brand name"), { target: { value: "New Brand" } });
  fireEvent.change(screen.getByLabelText("Result 1 value"), { target: { value: "250K+" } });
  fireEvent.change(screen.getByLabelText("Result 1 label"), { target: { value: "People reached" } });
  fireEvent.change(screen.getByLabelText("Footer headline"), { target: { value: "Grow with us" } });
  fireEvent.change(screen.getByLabelText("Contact email"), { target: { value: "hello@example.com" } });
  fireEvent.click(screen.getByRole("button", { name: "Remove logo" }));
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("saved"));
  const data = fetchMock.mock.calls[0][1].body as FormData;
  expect(data.get("brandName")).toBe("New Brand");
  expect(data.get("resultsMetric1Value")).toBe("250K+");
  expect(data.get("resultsMetric1Label")).toBe("People reached");
  expect(data.get("footerCtaHeading")).toBe("Grow with us");
  expect(data.get("footerEmail")).toBe("hello@example.com");
  expect(data.get("logoUrl")).toBe("");
  expect(mocks.refresh).toHaveBeenCalledOnce();
});

test("admin keeps edits when saving fails", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: "Upload failed" }) }));
  render(<SiteContentForm initialContent={defaultSiteContent} />);
  fireEvent.change(screen.getByLabelText("Headline"), { target: { value: "Keep my edit" } });
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Upload failed"));
  expect(screen.getByLabelText("Headline")).toHaveValue("Keep my edit");
});
