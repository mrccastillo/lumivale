import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { CaseStudyForm } from "@/app/admin/case-studies/case-study-form";
import { StoryImagePicker } from "@/app/admin/case-studies/story-image-picker";
import { defaultCaseStudies } from "@/lib/case-studies";
import { asStoryInput, paragraph } from "@/lib/case-study-story";

const router = vi.hoisted(() => ({ refresh: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

test("saves incomplete drafts, retains failed edits, and previews without publishing", async () => {
  const fetch = vi
    .fn()
    .mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Save failed" }),
    });
  vi.stubGlobal("fetch", fetch);
  render(<CaseStudyForm />);
  fireEvent.change(screen.getByLabelText("Title"), {
    target: { value: "Our campaign" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Preview story" }));
  expect(
    screen.getByRole("region", { name: "Story preview" }),
  ).toHaveTextContent("Our campaign");
  expect(fetch).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Mobile" }));
  expect(screen.getByRole("button", { name: "Mobile" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  fireEvent.click(screen.getByRole("button", { name: "Create case study" }));
  await waitFor(() =>
    expect(screen.getByRole("alert")).toHaveTextContent("Save failed"),
  );
  expect(screen.getByLabelText("Title")).toHaveValue("Our campaign");
  const body = JSON.parse(fetch.mock.calls[0][1].body);
  expect(body.status).toBe("draft");
  expect(body.schemaVersion).toBe(2);
  fetch.mockResolvedValue({ ok: true, json: async () => ({ study: body }) });
  fireEvent.click(screen.getByRole("button", { name: "Create case study" }));
  await waitFor(() =>
    expect(screen.getByRole("status")).toHaveTextContent("Draft saved"),
  );
  expect(screen.getByText("No unsaved changes")).toBeInTheDocument();
});

test("stable sections and evidence survive reorder and removal", async () => {
  const input = asStoryInput(defaultCaseStudies[0]);
  input.status = "draft";
  input.sections = [
    {
      id: "a",
      type: "imageText",
      heading: "First",
      body: paragraph("Evidence"),
      side: "left",
      image: {
        url: "https://res.cloudinary.com/demo/image/upload/a.png",
        alt: "Proof A",
      },
    },
    {
      id: "b",
      type: "narrative",
      heading: "Second",
      body: paragraph("Context"),
    },
  ];
  const fetch = vi
    .fn()
    .mockImplementation(async (_url, options) => ({
      ok: true,
      json: async () => ({ study: JSON.parse(options.body) }),
    }));
  vi.stubGlobal("fetch", fetch);
  render(<CaseStudyForm study={{ ...defaultCaseStudies[0], ...input }} />);
  fireEvent.click(screen.getByRole("button", { name: "4 Story" }));
  fireEvent.click(within(screen.getByRole("navigation", { name: "Story outline" })).getByRole("button", { name: /Second/ }));
  fireEvent.click(
    within(screen.getByRole("region", { name: "Section 2: Text" })).getByRole(
      "button",
      { name: "Move up" },
    ),
  );
  fireEvent.click(within(screen.getByRole("navigation", { name: "Story outline" })).getByRole("button", { name: /First/ }));
  expect(
    within(
      screen.getByRole("region", { name: "Section 2: Image + text" }),
    ).getByLabelText("Alternative text"),
  ).toHaveValue("Proof A");
  fireEvent.click(within(screen.getByRole("navigation", { name: "Story outline" })).getByRole("button", { name: /Second/ }));
  fireEvent.click(
    within(screen.getByRole("region", { name: "Section 1: Text" })).getByRole(
      "button",
      { name: "Remove section" },
    ),
  );
  fireEvent.click(screen.getByRole("button", { name: "Save case study" }));
  await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
  const body = JSON.parse(fetch.mock.calls[0][1].body);
  expect(body.sections).toHaveLength(1);
  expect(body.sections[0].id).toBe("a");
  expect(body.sections[0].image.alt).toBe("Proof A");
});

test("all section types can be added and incomplete publishing identifies fields", () => {
  render(<CaseStudyForm />);
  fireEvent.click(screen.getByRole("button", { name: "4 Story" }));
  for (const name of [
    "Add image + text",
    "Add full-width image",
    "Add image gallery",
    "Add before / after",
    "Add client quote",
  ]) {
    fireEvent.click(screen.getByRole("button", { name: "Add section", exact: true }));
    fireEvent.click(screen.getByRole("button", { name }));
  }
  expect(screen.getByLabelText("Quote")).toBeInTheDocument();
  fireEvent.click(within(screen.getByRole("navigation", { name: "Story outline" })).getByRole("button", { name: /Image gallery/ }));
  expect(
    screen.getByRole("button", { name: "Add gallery image" }),
  ).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Title"), {
    target: { value: "Story" },
  });
  fireEvent.change(screen.getByLabelText("Status"), {
    target: { value: "published" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Create case study" }));
  expect(screen.getByRole("alert")).toHaveTextContent("metrics");
});

test("failed image upload preserves old image and cancellation ignores stale completion", async () => {
  const onChange = vi.fn();
  const onPending = vi.fn();
  const fetch = vi
    .fn()
    .mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Upload unavailable" }),
    });
  vi.stubGlobal("fetch", fetch);
  render(
    <StoryImagePicker
      label="Evidence"
      value={{
        url: "https://res.cloudinary.com/demo/image/upload/old.png",
        alt: "Old evidence",
      }}
      onChange={onChange}
      onPending={onPending}
    />,
  );
  const file = new File(["image"], "proof.png", { type: "image/png" });
  fireEvent.change(screen.getByLabelText("Evidence"), {
    target: { files: [file] },
  });
  await waitFor(() =>
    expect(screen.getByRole("alert")).toHaveTextContent("Upload unavailable"),
  );
  expect(onChange).not.toHaveBeenCalled();
  expect(screen.getByAltText("Old evidence")).toBeInTheDocument();
  let resolve!: (value: unknown) => void;
  fetch.mockImplementationOnce(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  fireEvent.change(screen.getByLabelText("Evidence"), {
    target: { files: [file] },
  });
  fireEvent.click(screen.getByRole("button", { name: "Remove image" }));
  await act(async () => {
    resolve({
      ok: true,
      json: async () => ({
        url: "https://res.cloudinary.com/demo/image/upload/stale.png",
      }),
    });
  });
  expect(onChange).toHaveBeenCalledExactlyOnceWith(undefined);
  expect(onPending.mock.calls.map((call) => call[0])).toEqual([1, -1, 1, -1]);
});

test("step navigation preserves input and validation returns to the failing step", async () => {
  render(<CaseStudyForm />);
  fireEvent.change(screen.getByLabelText("Title"), { target: { value: "A complete story" } });
  fireEvent.click(screen.getByRole("button", { name: "Next: Client & images" }));
  expect(screen.getByLabelText("Title")).not.toBeVisible();
  fireEvent.change(screen.getByLabelText("Client name (optional)"), { target: { value: "Acme" } });
  fireEvent.click(screen.getByRole("button", { name: "1 Overview" }));
  expect(screen.getByLabelText("Title")).toHaveValue("A complete story");
  fireEvent.click(screen.getByRole("button", { name: "2 Client & images" }));
  expect(screen.getByLabelText("Client name (optional)")).toHaveValue("Acme");
  fireEvent.change(screen.getByLabelText("Title"), { target: { value: "" } });
  fireEvent.click(screen.getByRole("button", { name: "Create case study" }));
  await waitFor(() => expect(screen.getByRole("textbox", { name: /^Title/ })).toBeVisible());
  expect(screen.getByRole("button", { name: /1 Overview/ })).toHaveAttribute("aria-current", "step");
});

test("editing one section at a time preserves content when switching", () => {
  const input = asStoryInput(defaultCaseStudies[0]);
  input.sections = [
    { id: "one", type: "narrative", heading: "First section", body: paragraph("First body") },
    { id: "two", type: "narrative", heading: "Second section", body: paragraph("Second body") },
  ];
  render(<CaseStudyForm study={{ ...defaultCaseStudies[0], ...input }} />);
  fireEvent.click(screen.getByRole("button", { name: "4 Story" }));
  expect(screen.getAllByRole("region", { name: /^Section / })).toHaveLength(1);
  fireEvent.change(within(screen.getByRole("region", { name: "Section 1: Text" })).getByLabelText("Section heading"), { target: { value: "Updated first" } });
  const outline = screen.getByRole("navigation", { name: "Story outline" });
  fireEvent.click(within(outline).getByRole("button", { name: /Second section/ }));
  expect(screen.getAllByRole("region", { name: /^Section / })).toHaveLength(1);
  fireEvent.click(within(outline).getByRole("button", { name: /Updated first/ }));
  expect(within(screen.getByRole("region", { name: "Section 1: Text" })).getByLabelText("Section heading")).toHaveValue("Updated first");
});
