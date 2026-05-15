import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { ServiceForm } from "@/app/admin/services/service-form";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("admin service form uploads", () => {
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
