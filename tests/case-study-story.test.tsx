import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import {
  asStoryInput,
  newSection,
  paragraph,
  parseStoryInput,
  richText,
  safeStoryUrl,
  storySections,
} from "@/lib/case-study-story";
import { CaseStudyStory, StoryRichText } from "@/components/case-study-story";
import {
  createCaseStudy,
  defaultCaseStudies,
  getAdminCaseStudyBySlug,
  getPublishedCaseStudiesForSite,
  getPublishedCaseStudyBySlugForSite,
  updateCaseStudy,
} from "@/lib/case-studies";
import { getMongoDb } from "@/lib/mongodb";

vi.mock("@/lib/mongodb", () => ({ getMongoDb: vi.fn() }));
afterEach(() => vi.unstubAllEnvs());
import { image, fullStory } from "./fixtures/case-study-story";

describe("case-study story contract", () => {
  test("validates all section types and preserves formatted-text whitespace", () => {
    const study = fullStory();
    expect(parseStoryInput(study, "demo").sections).toHaveLength(7);
    study.sections![0] = {
      id: "text",
      type: "narrative",
      heading: "Text",
      body: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: "Before " },
              { type: "text", text: "bold", marks: [{ type: "bold" }] },
              { type: "text", text: " after" },
            ],
          },
        ],
      },
    };
    const parsed = parseStoryInput(study);
    expect(parsed.sections?.[0]).toEqual(study.sections![0]);
  });
  test("allows incomplete drafts but enforces complete publishing and bounds", () => {
    const draft = { ...asStoryInput(), slug: "draft", title: "Draft" };
    expect(parseStoryInput(draft).status).toBe("draft");
    expect(() => parseStoryInput({ ...draft, status: "published" })).toThrow();
    expect(() =>
      parseStoryInput({
        ...fullStory(),
        metrics: [{ id: "m", value: "x".repeat(25), label: "Views" }],
      }),
    ).toThrow("24");
    expect(() =>
      parseStoryInput({
        ...draft,
        sections: Array.from({ length: 31 }, (_, i) =>
          newSection("narrative", String(i)),
        ),
      }),
    ).toThrow();
    expect(() =>
      parseStoryInput({ ...draft, sections: [{ id: "x", type: "script" }] }),
    ).toThrow();
    expect(() =>
      parseStoryInput({ ...draft, summary: "x".repeat(1024 * 1024) }),
    ).toThrow("1 MiB");
  });
  test("rejects unsafe markup, links, images, and missing alternative text", () => {
    expect(safeStoryUrl("javascript:alert(1)")).toBe(false);
    expect(safeStoryUrl("//evil.example")).toBe(false);
    expect(safeStoryUrl("/\\evil.example")).toBe(false);
    expect(safeStoryUrl("/services")).toBe(true);
    expect(() =>
      parseStoryInput({ ...fullStory(), cover: { ...image, alt: "" } }),
    ).toThrow();
    expect(() => parseStoryInput(fullStory(), "different-account")).toThrow();
    expect(() =>
      parseStoryInput({
        ...fullStory(),
        cover: { ...image, url: "data:image/png;base64,bad" },
      }),
    ).toThrow();
    expect(() =>
      parseStoryInput({
        ...fullStory(),
        sections: [
          {
            id: "bad",
            type: "narrative",
            heading: "Bad",
            body: {
              type: "doc",
              content: [{ type: "script", text: "alert(1)" }],
            },
          },
        ],
      }),
    ).toThrow();
    render(
      <StoryRichText
        node={{
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Safe text",
                  marks: [
                    { type: "link", attrs: { href: "javascript:alert(1)" } },
                  ],
                },
              ],
            },
            { type: "script", text: "evil" },
          ],
        }}
      />,
    );
    expect(screen.getByText("Safe text")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByText("evil")).not.toBeInTheDocument();
  });
  test("adapts legacy records without mutating them or restoring removed sections", () => {
    const legacy = structuredClone(defaultCaseStudies[0]);
    const before = JSON.stringify(legacy);
    const adapted = asStoryInput(legacy);
    expect(adapted.sections).toHaveLength(3);
    expect(
      richText(
        (adapted.sections![0] as { body: ReturnType<typeof paragraph> }).body,
      ),
    ).toBe(legacy.challenge);
    expect(JSON.stringify(legacy)).toBe(before);
    expect(storySections({ ...adapted, sections: [] })).toEqual([]);
  });
  test("renders full evidence without cropping and exposes comparison, quote, and CTA", () => {
    const { container } = render(<CaseStudyStory study={fullStory()} />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByText("Before content")).toBeInTheDocument();
    expect(screen.getByText("After content")).toBeInTheDocument();
    expect(screen.getByText("Client Name")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact us" })).toHaveAttribute(
      "href",
      "/contact",
    );
    expect(
      screen.getAllByRole("link", {
        name: "View full image: Campaign evidence",
      }),
    ).toHaveLength(4);
    expect(container.querySelector("figure img")).toHaveClass("object-contain");
    expect(container.querySelector("figure img")).toHaveAttribute(
      "width",
      "900",
    );
  });
  test("outages cannot restore unpublished seeded stories", async () => {
    vi.mocked(getMongoDb).mockRejectedValue(new Error("offline"));
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await getPublishedCaseStudiesForSite()).toEqual([]);
    expect(
      await getPublishedCaseStudyBySlugForSite(defaultCaseStudies[0].slug),
    ).toBeNull();
    log.mockRestore();
  });
  test("persists new stories and legacy conversion, including image removal and unpublishing", async () => {
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", "demo");
    const documents: Record<string, unknown>[] = [];
    const collection = {
      findOne: async (query: Record<string, unknown>) =>
        documents.find((d) => d.slug === query.slug) ?? null,
      insertOne: async (document: Record<string, unknown>) => {
        documents.push(document);
        return { insertedId: document._id };
      },
      findOneAndUpdate: async (
        query: Record<string, unknown>,
        update: { $set: Record<string, unknown> },
      ) => {
        let document = documents.find((d) => d.slug === query.slug);
        if (!document) {
          document = { _id: "legacy-override" };
          documents.push(document);
        }
        Object.assign(document, update.$set);
        return document;
      },
    };
    const db = { collection: () => collection };
    const created = await createCaseStudy(db, fullStory());
    expect(created.sections).toHaveLength(7);
    expect((await getAdminCaseStudyBySlug(db, created.slug))?.cover).toEqual(
      image,
    );
    const updated = await updateCaseStudy(db, created.slug, {
      status: "draft",
      cover: undefined,
      sections: [],
    });
    expect(updated.sections).toEqual([]);
    expect(updated.cover).toBeUndefined();
    const legacy = asStoryInput(defaultCaseStudies[0]);
    const converted = await updateCaseStudy(db, legacy.slug, legacy);
    expect(converted.schemaVersion).toBe(2);
    expect(converted.challenge).toBe(legacy.challenge);
    await expect(createCaseStudy(db, fullStory())).rejects.toThrow(
      "already exists",
    );
    await expect(
      updateCaseStudy(db, legacy.slug, { slug: "renamed" }),
    ).rejects.toThrow("cannot be changed");
  });
});
