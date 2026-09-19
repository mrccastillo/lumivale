import { fireEvent, render, screen, within, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { ServiceForm } from "@/app/admin/services/service-form";
import { getDefaultServices } from "@/lib/services";

afterEach(() => vi.unstubAllGlobals());
function addPlatform(name: string) {
  fireEvent.change(screen.getByLabelText("New platform"), { target: { value: name } });
  fireEvent.click(screen.getByRole("button", { name: "Add platform" }));
}
test("new services start empty; platform names validate and ordering can be edited", () => {
  const { container, unmount } = render(<ServiceForm />);
    for (const name of ["title", "summary", "description", "highlights", "pricePreview", "heroDescription", "pricingLines"]) {
      fireEvent.change(document.querySelector(`[name="${name}"]`)!, { target: { value: name === "pricingLines" ? "Monthly rate | $850" : "Service content" } });
    }
    fireEvent.click(screen.getByRole("tab", { name: /Examples$/ }));
  expect(screen.queryByRole("button", { name: "Add Example" })).toBeNull();
  addPlatform(" YouTube "); addPlatform("youtube");
  expect(screen.getByRole("alert")).toHaveTextContent("unique platform name");
  addPlatform("Other websites");
  const other = screen.getByRole("region", { name: "Other websites examples" });
  fireEvent.click(within(other).getByRole("button", { name: "Move up" }));
  fireEvent.change(within(other).getByLabelText("Platform name"), { target: { value: "Websites" } });
  fireEvent.click(within(other).getByRole("button", { name: "Rename platform" }));
  const manifest = JSON.parse((container.querySelector('[name="exampleManifest"]') as HTMLInputElement).value);
  expect(manifest.platforms.map((item: { name: string }) => item.name)).toEqual(["Websites", "YouTube"]);
  unmount();
  const service = getDefaultServices()[0];
  render(<ServiceForm service={{ ...service, privateContent: { ...service.privateContent, examplePlatforms: manifest.platforms, exampleCards: [] } }} />);
    fireEvent.click(screen.getByRole("tab", { name: /Examples$/ }));
  expect(screen.getAllByLabelText("Platform name").map((input) => (input as HTMLInputElement).value)).toEqual(["Websites", "YouTube"]);
  fireEvent.click(within(screen.getByRole("region", { name: "Websites examples" })).getByRole("button", { name: "Remove platform" }));
  expect(screen.queryByRole("region", { name: "Websites examples" })).toBeNull();
});

test("moving a draft preserves files and IDs when another example is removed; cancel keeps original assignment", async () => {
  const fetchMock = vi.fn().mockResolvedValue({ url: "/admin/services/example/edit" });
  vi.stubGlobal("fetch", fetchMock);
  const service = getDefaultServices()[0];
  service.privateContent.examplePlatforms = [{ id: "one", name: "Reddit" }, { id: "two", name: "YouTube" }];
  service.privateContent.exampleCards = [{ id: "saved", platformId: "one", title: "Saved", tag: "Proof", summary: "Summary", exampleType: "link", previewUrl: "https://example.com" }];
  render(<ServiceForm service={service} />);
    fireEvent.click(screen.getByRole("tab", { name: /Examples$/ }));
  const reddit = screen.getByRole("region", { name: "Reddit examples" });
  expect(within(reddit).getByRole("button", { name: "Remove platform" })).toBeDisabled();
  fireEvent.click(within(reddit).getByRole("button", { name: "Add Example" }));
  fireEvent.click(screen.getByRole("button", { name: /^Photo/ }));
  const dialog = screen.getByRole("dialog");
  fireEvent.change(within(dialog).getByLabelText("Card title"), { target: { value: "Pending" } });
  fireEvent.change(within(dialog).getByLabelText("Tag"), { target: { value: "Screenshot" } });
  fireEvent.change(within(dialog).getByLabelText("Description"), { target: { value: "Photo proof" } });
  const photo = new File(["photo"], "pending.png", { type: "image/png" });
  const video = new File(["video"], "pending.mp4", { type: "video/mp4" });
  fireEvent.change(within(dialog).getByLabelText("Upload photo"), { target: { files: [photo] } });
  fireEvent.change(within(dialog).getByLabelText("Upload video"), { target: { files: [video] } });
  fireEvent.click(within(dialog).getByRole("button", { name: "Add example" }));
  const pending = screen.getByRole("heading", { name: "Pending" }).closest("article")!;
  fireEvent.click(within(pending).getByRole("button", { name: "Edit" }));
  fireEvent.change(screen.getByLabelText("Platform"), { target: { value: "two" } });
  fireEvent.click(screen.getByRole("button", { name: "Close example modal" }));
  expect(within(reddit).getByText("Pending")).toBeInTheDocument();
  fireEvent.click(within(pending).getByRole("button", { name: "Edit" }));
  fireEvent.change(screen.getByLabelText("Platform"), { target: { value: "two" } });
  fireEvent.click(screen.getByRole("button", { name: "Save example" }));
  fireEvent.click(within(reddit).getByRole("button", { name: "Remove", exact: true }));
  expect(within(reddit).getByRole("button", { name: "Remove platform" })).toBeEnabled();
  fireEvent.submit(screen.getByRole("button", { name: "Save service" }).closest("form")!);
  await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
  const form = fetchMock.mock.calls[0][1].body as FormData;
  const manifest = JSON.parse(String(form.get("exampleManifest")));
  expect(manifest.examples).toHaveLength(1);
  expect(manifest.examples[0]).toMatchObject({ platformId: "two", title: "Pending", tag: "Screenshot" });
  expect(form.get(`exampleCardImageFile-${manifest.examples[0].id}`)).toBe(photo);
  expect(form.get(`exampleCardVideoFile-${manifest.examples[0].id}`)).toBe(video);
});


test("platform tabs retain draft names, follow reordering, and select a remaining platform after removal", () => {
  const service = getDefaultServices()[0];
  service.privateContent.examplePlatforms = [{ id: "reddit", name: "Reddit" }, { id: "linkedin", name: "LinkedIn" }];
  service.privateContent.exampleCards = [];
  render(<ServiceForm service={service} />);
  fireEvent.click(screen.getByRole("tab", { name: /Examples$/ }));
  const reddit = screen.getByRole("tab", { name: "Reddit" });
  fireEvent.change(within(screen.getByRole("region", { name: "Reddit examples" })).getByLabelText("Platform name"), { target: { value: "Reddit community" } });
  fireEvent.keyDown(reddit, { key: "ArrowRight" });
  expect(screen.getByRole("tab", { name: "LinkedIn" })).toHaveFocus();
  expect(screen.queryByRole("region", { name: "Reddit examples" })).toBeNull();
  fireEvent.click(reddit);
  expect(within(screen.getByRole("region", { name: "Reddit examples" })).getByLabelText("Platform name")).toHaveValue("Reddit community");
  fireEvent.click(screen.getByRole("button", { name: "Rename platform" }));
  expect(screen.getByRole("tab", { name: "Reddit community" })).toHaveAttribute("aria-selected", "true");
  fireEvent.click(screen.getByRole("button", { name: "Move down" }));
  expect(screen.getByRole("tab", { name: "Reddit community" })).toHaveAttribute("aria-selected", "true");
  fireEvent.click(screen.getByRole("button", { name: "Remove platform" }));
  expect(screen.getByRole("tab", { name: "LinkedIn" })).toHaveAttribute("aria-selected", "true");
  expect(screen.getByRole("region", { name: "LinkedIn examples" })).toBeVisible();
});
