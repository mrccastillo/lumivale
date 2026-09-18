import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { ServiceForm } from "@/app/admin/services/service-form";
import { getDefaultServices } from "@/lib/services";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("admin service form uploads", () => {
  test("requires a cover, submits it, and supports removing it", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ url: "/admin/services/example/edit" });
    vi.stubGlobal("fetch", fetchMock);
    render(<ServiceForm />);
    fireEvent.click(screen.getByRole("button", { name: "Add Example" }));
    fireEvent.click(screen.getByRole("button", { name: /^Link Preview/ }));
    fireEvent.change(screen.getByLabelText("Preview link"), { target: { value: "https://example.com/article" } });
    fireEvent.change(screen.getByLabelText("Preview appearance"), { target: { value: "cover" } });
    fireEvent.click(screen.getByRole("button", { name: "Add example" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Upload a cover");
    const photo = new File(["photo"], "cover.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Upload cover photo"), { target: { files: [photo] } });
    fireEvent.change(screen.getByLabelText("Cover alt text"), { target: { value: "Cover preview" } });
    await waitFor(() => expect(screen.getByRole("img", { name: "Cover preview" })).toHaveAttribute("src", expect.stringContaining("data:")));
    fireEvent.click(screen.getByRole("button", { name: "Add example" }));
    fireEvent.submit(screen.getByRole("button", { name: "Create service" }).closest("form")!);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const submitted = fetchMock.mock.calls[0][1].body as FormData;
    expect(submitted.get("exampleCardPreviewMode-0")).toBe("cover");
    expect(submitted.get("exampleCardImageFile-0")).toBe(photo);
    expect(submitted.get("exampleCardPreviewUrl-0")).toBe("https://example.com/article");
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove cover photo" }));
    expect(screen.getByLabelText("Preview appearance")).toHaveValue("automatic");
    expect(screen.getByLabelText("Preview link")).toHaveValue("https://example.com/article");
  });

  test("reloads a saved cover and clears it when automatic preview is selected", () => {
    const service = getDefaultServices()[0];
    service.privateContent.exampleCards = [{ title: "Saved example", tag: "Proof", summary: "Summary", exampleType: "link", imageUrl: "https://example.com/cover.png", previewUrl: "https://example.com/article" }];
    const { container } = render(<ServiceForm service={service} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByLabelText("Preview appearance")).toHaveValue("cover");
    expect(screen.getByRole("img")).toHaveAttribute("src", "https://example.com/cover.png");
    fireEvent.change(screen.getByLabelText("Preview appearance"), { target: { value: "automatic" } });
    fireEvent.click(screen.getByRole("button", { name: "Save example" }));
    expect(container.querySelector('[name="exampleCardImageUrl-0"]')).toHaveValue("");
    expect(container.querySelector('[name="exampleCardPreviewUrl-0"]')).toHaveValue("https://example.com/article");
  });

  test("submits selected example photo and video files", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ url: "/admin/services/new-service/edit" });
    vi.stubGlobal("fetch", fetchMock);
    render(<ServiceForm submitLabel="Create service" />);

    fireEvent.click(screen.getByRole("button", { name: "Add Example" }));
    fireEvent.click(screen.getByRole("button", { name: /^Photo/ }));

    const dialog = screen.getByRole("dialog", { name: "Example Details" });

    fireEvent.change(within(dialog).getByLabelText("Card title"), {
      target: { value: "Comment screenshot" },
    });
    fireEvent.change(within(dialog).getByLabelText("Tag"), {
      target: { value: "Proof" },
    });
    fireEvent.change(within(dialog).getByLabelText("Description"), {
      target: { value: "A placed comment example." },
    });
    fireEvent.change(within(dialog).getByLabelText("Photo alt text"), {
      target: { value: "Screenshot of a comment" },
    });

    const photo = new File(["photo"], "comment.png", { type: "image/png" });
    const video = new File(["video"], "walkthrough.mp4", { type: "video/mp4" });

    fireEvent.change(within(dialog).getByLabelText("Upload photo"), {
      target: { files: [photo] },
    });
    fireEvent.change(within(dialog).getByLabelText("Upload video"), {
      target: { files: [video] },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Add example" }));

    const form = screen.getByRole("button", { name: "Create service" }).closest("form");

    if (!form) {
      throw new Error("Expected service form");
    }

    fireEvent.submit(form);

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    const submittedFormData = fetchMock.mock.calls[0][1].body as FormData;

    expect(submittedFormData.get("exampleCardImageFile-0")).toBe(photo);
    expect(submittedFormData.get("exampleCardVideoFile-0")).toBe(video);
  });
});
