import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ServiceExamplePlatforms } from "@/components/service-example-platforms";
import { normalizeExamplePlatforms, parseExampleManifest } from "@/lib/service-example-platforms";
import { getDefaultServices, parseServiceFormData, type PrivateServiceContent } from "@/lib/services";

const card = (tag = "Proof") => ({ title: `${tag} example`, tag, summary: "Description", exampleType: "link" as const, previewUrl: "https://example.com", imageUrl: "https://example.com/photo.png", videoUrl: "https://example.com/video.mp4", videoDescription: "Walkthrough", imageAlt: "Cover" });
function legacy(label: string, tags: string[]): PrivateServiceContent {
  return { ...getDefaultServices()[0].privateContent, examplePlatforms: undefined, examplePlatform: label, exampleCards: tags.map(card) };
}
const platforms = [{ id: "yt", name: "YouTube" }, { id: "web", name: "Other websites" }, { id: "empty", name: "Empty" }];
const examples = Array.from({ length: 8 }, (_, index) => ({ ...card(`Proof ${index}`), id: `card-${index}`, platformId: index % 2 ? "web" : "yt" }));

describe("platform compatibility and validation", () => {
  test.each([
    ["Reddit", ["UGC", "GEO"], ["Reddit"], [0, 0]],
    [" Reddit | LinkedIn | reddit ", ["Reddit", "linkedin", "GEO"], ["reddit", "LinkedIn", "General"], [0, 1, 2]],
    ["Reddit | General", ["GEO", "general"], ["Reddit", "General"], [1, 1]],
    ["", ["GEO"], ["General"], [0]],
    ["", [], [], []],
  ])("adapts %s without losing media", (label, tags, names, assignments) => {
    const source = legacy(label, tags as string[]);
    const result = normalizeExamplePlatforms(source);
    expect(result.examplePlatforms.map((p) => p.name)).toEqual(names);
    result.exampleCards.forEach((value, index) => {
      expect(value).toMatchObject(source.exampleCards[index]);
      expect(value.platformId).toBe(result.examplePlatforms[(assignments as number[])[index]].id);
    });
    expect(normalizeExamplePlatforms(result)).toEqual(result);
    expect(normalizeExamplePlatforms(source)).toEqual(result);
  });
  test("explicit empty platforms override the old label", () => {
    expect(normalizeExamplePlatforms({ ...legacy("Reddit", []), examplePlatforms: [] }).examplePlatforms).toEqual([]);
  });
  test.each([
    { platforms: [{ id: "x", name: " " }], examples: [] },
    { platforms: [{ id: "x", name: "a".repeat(61) }], examples: [] },
    { platforms: [{ id: "x", name: "Reddit" }, { id: "y", name: " reddit " }], examples: [] },
    { platforms: [{ id: "x", name: "Reddit" }, { id: "x", name: "YouTube" }], examples: [] },
    { platforms: [{ id: "bad/id", name: "Reddit" }], examples: [] },
    { platforms, examples: [{ ...examples[0], platformId: "foreign-service-platform" }] },
    { platforms, examples: [examples[0], examples[0]] },
    { platforms, examples: [{ ...examples[0], id: "" }] },
    { platforms, examples: [{ ...examples[0], title: " " }] },
  ])("rejects invalid manifest %#", (value) => {
    expect(() => parseExampleManifest(JSON.stringify(value))).toThrow();
  });
  test.each(["{", "null", "[]", '{"platforms":[]}'])("rejects malformed %s", (value) => {
    expect(() => parseExampleManifest(value)).toThrow();
  });
  test("parses eight stable examples and ordered platforms", () => {
    const form = new FormData();
    form.set("exampleManifest", JSON.stringify({ platforms: [...platforms].reverse(), examples }));
    const parsed = parseServiceFormData(form).privateContent;
    expect(parsed.exampleCards).toHaveLength(8);
    expect(parsed.examplePlatform).toBe("Empty | Other websites | YouTube");
    expect(parsed.exampleCards[7]).toMatchObject({ id: "card-7", platformId: "web", uploadKey: "card-7" });
    form.set("exampleManifest", JSON.stringify({ platforms: [], examples: [] }));
    expect(parseServiceFormData(form).privateContent.exampleCards).toEqual([]);
  });
  test("keeps sparse legacy file indices past six, including after whitespace-only cards", () => {
    const form = new FormData();
    form.set("exampleCardTitle-0", " ");
    for (const index of [2, 8, 14]) {
      form.set(`exampleCardTitle-${index}`, `Card ${index}`);
      form.set(`exampleCardTag-${index}`, "GEO");
      form.set(`exampleCardSummary-${index}`, "Summary");
    }
    expect(parseServiceFormData(form).privateContent.exampleCards.map((value) => value.uploadKey)).toEqual(["2", "8", "14"]);
  });
});

describe("visitor platform tabs", () => {
  function content() { return { ...legacy("Old label", []), examplePlatforms: platforms, exampleCards: examples }; }
  test("filters by saved platform order and unmounts inactive media", () => {
    const { container } = render(<ServiceExamplePlatforms content={content()} />);
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual(["YouTube", "Other websites"]);
    expect(screen.getByRole("tab", { name: "YouTube" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("heading", { name: "Proof 0 example" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Proof 1 example" })).toBeNull();
    const video = container.querySelector("video");
    fireEvent.click(screen.getByRole("tab", { name: "Other websites" }));
    expect(video?.isConnected).toBe(false);
    expect(screen.queryByRole("heading", { name: "Proof 0 example" })).toBeNull();
    expect(screen.getByRole("heading", { name: "Proof 1 example" })).toBeInTheDocument();
    expect(screen.getAllByText("Proof 1")).toHaveLength(1);
  });
  test("supports manual keyboard activation, wrapping, Home and End", () => {
    render(<ServiceExamplePlatforms content={content()} />);
    const [first, second] = screen.getAllByRole("tab");
    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(second).toHaveFocus();
    expect(first).toHaveAttribute("aria-selected", "true");
    expect(second).toHaveAttribute("tabindex", "0");
    fireEvent.click(second); // Native button Enter/Space activation emits click.
    expect(second).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", second.id);
    fireEvent.keyDown(second, { key: "ArrowRight" }); expect(first).toHaveFocus();
    fireEvent.keyDown(first, { key: "ArrowLeft" }); expect(second).toHaveFocus();
    fireEvent.keyDown(second, { key: "Home" }); expect(first).toHaveFocus();
    fireEvent.keyDown(first, { key: "End" }); expect(second).toHaveFocus();
  });
  test("shows a single populated tab and a clear no-examples state", () => {
    const { rerender } = render(<ServiceExamplePlatforms content={{ ...content(), exampleCards: [examples[0]] }} />);
    expect(screen.getAllByRole("tab")).toHaveLength(1);
    rerender(<ServiceExamplePlatforms content={{ ...content(), exampleCards: [] }} />);
    expect(screen.queryByRole("tablist")).toBeNull();
    expect(screen.getByText("No examples available yet.")).toBeInTheDocument();
  });
});
