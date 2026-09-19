export type RichNode = {
  type: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  content?: RichNode[];
};
export type StoryImage = {
  url: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
};
export type StorySection =
  | { id: string; type: "narrative"; heading: string; body: RichNode }
  | {
      id: string;
      type: "imageText";
      heading: string;
      body: RichNode;
      image?: StoryImage;
      side: "left" | "right";
    }
  | {
      id: string;
      type: "image";
      heading: string;
      image?: StoryImage;
      sourceUrl: string;
    }
  | {
      id: string;
      type: "gallery";
      heading: string;
      images: (StoryImage & { id: string })[];
    }
  | {
      id: string;
      type: "comparison";
      heading: string;
      beforeLabel: string;
      afterLabel: string;
      before: RichNode;
      after: RichNode;
    }
  | {
      id: string;
      type: "quote";
      quote: string;
      personName: string;
      role: string;
      image?: StoryImage;
    };
export type StoryFields = {
  schemaVersion?: 2;
  clientName?: string;
  clientUrl?: string;
  industry?: string;
  timeframe?: string;
  channels?: string[];
  budget?: string;
  cover?: StoryImage;
  logo?: StoryImage;
  sections?: StorySection[];
  cta?: {
    heading: string;
    text: string;
    buttonText: string;
    buttonUrl: string;
  };
};
export type StoryInput = StoryFields & {
  slug: string;
  title: string;
  category: string;
  headline: string;
  summary: string;
  challenge: string;
  solution: string;
  outcomes: string[];
  metrics: { id?: string; value: string; label: string }[];
  sortOrder: number;
  status: "draft" | "published";
};
export class StoryValidationError extends Error {
  constructor(public errors: Record<string, string>) {
    super(Object.values(errors)[0] || "Invalid case study.");
  }
}
export function safeStoryUrl(value: string) {
  if (!value || /[\\\s\u0000-\u001f]/.test(value)) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    const url = new URL(value);
    return (
      ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}
export function safeImageUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "res.cloudinary.com" &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}
export function paragraph(text = ""): RichNode {
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        ...(text ? { content: [{ type: "text", text }] } : {}),
      },
    ],
  };
}
export function richText(node: RichNode): string {
  return node.text ?? node.content?.map(richText).join(" ") ?? "";
}
export function storySections(
  study: Pick<
    StoryInput,
    "schemaVersion" | "sections" | "challenge" | "solution" | "outcomes"
  >,
): StorySection[] {
  if (study.schemaVersion === 2) return study.sections ?? [];
  return [
    {
      id: "legacy-challenge",
      type: "narrative",
      heading: "Challenge",
      body: paragraph(study.challenge),
    },
    {
      id: "legacy-solution",
      type: "narrative",
      heading: "Solution",
      body: paragraph(study.solution),
    },
    {
      id: "legacy-results",
      type: "narrative",
      heading: "Outcomes",
      body: {
        type: "doc",
        content: [
          {
            type: "bulletList",
            content: study.outcomes.map((text) => ({
              type: "listItem",
              content: paragraph(text).content,
            })),
          },
        ],
      },
    },
  ];
}
export function newSection(
  type: StorySection["type"],
  id = crypto.randomUUID(),
): StorySection {
  switch (type) {
    case "narrative":
      return { id, type, heading: "", body: paragraph() };
    case "imageText":
      return { id, type, heading: "", body: paragraph(), side: "right" };
    case "image":
      return { id, type, heading: "", sourceUrl: "" };
    case "gallery":
      return { id, type, heading: "", images: [] };
    case "comparison":
      return {
        id,
        type,
        heading: "",
        beforeLabel: "Before",
        afterLabel: "After",
        before: paragraph(),
        after: paragraph(),
      };
    case "quote":
      return { id, type, quote: "", personName: "", role: "" };
  }
}
export function asStoryInput(study?: StoryInput): StoryInput {
  return {
    slug: "",
    title: "",
    headline: "",
    summary: "",
    category: "",
    challenge: "",
    solution: "",
    outcomes: [],
    metrics: [],
    sortOrder: 0,
    status: "draft",
    ...study,
    schemaVersion: 2,
    sections: study
      ? storySections(study)
      : ["Challenge", "Campaign", "Results"].map((heading, index) => ({
          id: `initial-${index}`,
          type: "narrative",
          heading,
          body: paragraph(),
        })),
    ...(study
      ? {
          metrics: study.metrics.map((metric, i) => ({
            ...metric,
            id: metric.id ?? `metric-${i}`,
          })),
        }
      : {}),
  };
}

/** Validate untrusted JSON on the server and the same structure before submitting in the editor. */
export function parseStoryInput(
  value: unknown,
  cloudName?: string,
): StoryInput {
  const errors: Record<string, string> = {};
  const fail = (path: string, message: string) => {
    errors[path] = message;
  };
  const object = (v: unknown): Record<string, unknown> =>
    v !== null && typeof v === "object" && !Array.isArray(v)
      ? (v as Record<string, unknown>)
      : {};
  const root = object(value);
  if (JSON.stringify(value ?? null).length > 1024 * 1024)
    throw new StoryValidationError({
      story: "Story must be 1 MiB or smaller.",
    });
  const published = root.status === "published";
  if (root.status !== "draft" && root.status !== "published")
    fail("status", "Choose Draft or Published.");
  const str = (v: unknown, path: string, max = 200, required = false) => {
    if (v !== undefined && typeof v !== "string") fail(path, "Enter text.");
    const text = typeof v === "string" ? v.trim() : "";
    if (required && !text) fail(path, "This field is required.");
    if (text.length > max) fail(path, `Use ${max} characters or fewer.`);
    return text;
  };
  const url = (v: unknown, path: string, required = false) => {
    const text = str(v, path, 2000, required);
    if (text && !safeStoryUrl(text))
      fail(path, "Use a page path or an HTTP/HTTPS URL.");
    return text;
  };
  const arr = (v: unknown, path: string, max: number) => {
    if (!Array.isArray(v)) {
      fail(path, "Expected a list.");
      return [];
    }
    if (v.length > max) fail(path, `Use at most ${max} items.`);
    return v.slice(0, max);
  };
  const image = (
    v: unknown,
    path: string,
    required = false,
  ): StoryImage | undefined => {
    if (v === undefined || v === null) {
      if (required) fail(path, "Upload an image.");
      return undefined;
    }
    const m = object(v);
    if (!published && m.url === "")
      return {
        url: "",
        alt: str(m.alt, `${path}.alt`, 500),
        caption: str(m.caption, `${path}.caption`, 1000),
      };
    const src = str(m.url, `${path}.url`, 2000, true);
    if (
      !safeImageUrl(src) ||
      (cloudName !== undefined &&
        new URL(src).pathname.split("/")[1] !== cloudName)
    )
      fail(path, "Use an image uploaded to this site's Cloudinary account.");
    return {
      url: src,
      alt: str(m.alt, `${path}.alt`, 500, published),
      caption: str(m.caption, `${path}.caption`, 1000),
      ...(Number.isFinite(m.width) && Number(m.width) > 0
        ? { width: Number(m.width) }
        : {}),
      ...(Number.isFinite(m.height) && Number(m.height) > 0
        ? { height: Number(m.height) }
        : {}),
    };
  };
  const rich = (v: unknown, path: string): RichNode => {
    if (JSON.stringify(v ?? null).length > 50000) {
      fail(path, "Text is too long.");
      return paragraph();
    }
    const visit = (raw: unknown, depth: number, parent?: string): RichNode => {
      const n = object(raw);
      const type = typeof n.type === "string" ? n.type : "";
      const allowed: Record<string, string[]> = {
        doc: ["paragraph", "heading", "bulletList", "orderedList"],
        paragraph: ["text"],
        heading: ["text"],
        bulletList: ["listItem"],
        orderedList: ["listItem"],
        listItem: ["paragraph", "bulletList", "orderedList"],
        text: [],
      };
      if (
        depth > 10 ||
        !(type in allowed) ||
        (!parent && type !== "doc") ||
        (parent && !allowed[parent]?.includes(type))
      ) {
        fail(path, "Unsupported text formatting.");
        return { type: "paragraph" };
      }
      const attrs = object(n.attrs);
      if (
        Object.keys(attrs).some(
          (key) =>
            !(
              type === "heading"
                ? ["level"]
                : type === "orderedList"
                  ? ["start", "type"]
                  : []
            ).includes(key),
        )
      )
        fail(path, "Unsupported text attributes.");
      if (type === "heading" && ![3, 4].includes(Number(attrs.level)))
        fail(path, "Use subsection headings only.");
      const marks =
        n.marks === undefined
          ? undefined
          : arr(n.marks, path, 4).map((rawMark) => {
              const mark = object(rawMark);
              const kind = str(mark.type, path, 20);
              const a = object(mark.attrs);
              if (
                !["bold", "italic", "underline", "link"].includes(kind) ||
                type !== "text"
              )
                fail(path, "Unsupported text formatting.");
              if (
                Object.keys(a).some(
                  (key) =>
                    !(
                      kind === "link"
                        ? ["href", "target", "rel", "class", "title"]
                        : []
                    ).includes(key),
                )
              )
                fail(path, "Unsupported link attributes.");
              return {
                type: kind,
                ...(kind === "link"
                  ? { attrs: { href: url(a.href, path, true) } }
                  : {}),
              };
            });
      return {
        type,
        ...(type === "text"
          ? {
              text:
                (str(n.text, path, 50000),
                typeof n.text === "string" ? n.text : ""),
            }
          : {}),
        ...(type === "heading"
          ? { attrs: { level: Number(attrs.level) } }
          : {}),
        ...(marks ? { marks } : {}),
        ...(n.content !== undefined
          ? {
              content: arr(n.content, path, 2000).map((child) =>
                visit(child, depth + 1, type),
              ),
            }
          : {}),
      };
    };
    const node = visit(v, 0);
    if (published && !richText(node).trim())
      fail(path, "Add section text before publishing.");
    return node;
  };
  const ids = new Set<string>();
  const id = (v: unknown, path: string) => {
    const text = str(v, path, 100, true);
    if (ids.has(text)) fail(path, "Each item must have a unique ID.");
    ids.add(text);
    return text;
  };
  const sections = arr(root.sections, "sections", 30).map(
    (raw, i): StorySection => {
      const s = object(raw);
      const p = `sections.${i}`;
      const sectionId = id(s.id, `${p}.id`);
      const heading = str(
        s.heading,
        `${p}.heading`,
        200,
        published && s.type !== "image" && s.type !== "quote",
      );
      switch (s.type) {
        case "narrative":
          return {
            id: sectionId,
            type: s.type,
            heading,
            body: rich(s.body, `${p}.body`),
          };
        case "imageText":
          if (s.side !== "left" && s.side !== "right")
            fail(`${p}.side`, "Choose left or right.");
          return {
            id: sectionId,
            type: s.type,
            heading,
            body: rich(s.body, `${p}.body`),
            side: s.side === "left" ? "left" : "right",
            image: image(s.image, `${p}.image`, published),
          };
        case "image":
          return {
            id: sectionId,
            type: s.type,
            heading,
            image: image(s.image, `${p}.image`, published),
            sourceUrl: url(s.sourceUrl, `${p}.sourceUrl`),
          };
        case "gallery": {
          const images = arr(s.images, `${p}.images`, 8).map((rawImage, j) => ({
            ...image(rawImage, `${p}.images.${j}`, true)!,
            id: id(object(rawImage).id, `${p}.images.${j}.id`),
          }));
          if (published && !images.length)
            fail(`${p}.images`, "Add at least one image.");
          return { id: sectionId, type: s.type, heading, images };
        }
        case "comparison":
          return {
            id: sectionId,
            type: s.type,
            heading,
            beforeLabel: str(s.beforeLabel, `${p}.beforeLabel`, 80, published),
            afterLabel: str(s.afterLabel, `${p}.afterLabel`, 80, published),
            before: rich(s.before, `${p}.before`),
            after: rich(s.after, `${p}.after`),
          };
        case "quote":
          return {
            id: sectionId,
            type: s.type,
            quote: str(s.quote, `${p}.quote`, 4000, published),
            personName: str(s.personName, `${p}.personName`, 200, published),
            role: str(s.role, `${p}.role`),
            image: image(s.image, `${p}.image`),
          };
        default:
          fail(p, "Choose a supported section type.");
          return newSection("narrative", sectionId);
      }
    },
  );
  const metrics = arr(root.metrics, "metrics", 8).map((raw, i) => {
    const m = object(raw);
    return {
      id: id(m.id, `metrics.${i}.id`),
      value: str(m.value, `metrics.${i}.value`, 24, published),
      label: str(m.label, `metrics.${i}.label`, 80, published),
    };
  });
  if (published && !metrics.length)
    fail("metrics", "Add at least one complete metric.");
  if (published && !sections.length)
    fail("sections", "Add at least one story section.");
  const slug = str(root.slug, "slug", 200, true);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    fail("slug", "Use lowercase letters, numbers, and hyphens.");
  const c = object(root.cta);
  const result: StoryInput = {
    schemaVersion: 2,
    slug,
    title: str(root.title, "title", 200, true),
    category: str(root.category, "category", 200, published),
    headline: str(root.headline, "headline", 200, published),
    summary: str(root.summary, "summary", 2000, published),
    challenge: str(root.challenge, "challenge", 50000),
    solution: str(root.solution, "solution", 50000),
    outcomes: arr(root.outcomes ?? [], "outcomes", 100).map((v, i) =>
      str(v, `outcomes.${i}`, 5000),
    ),
    metrics,
    sections,
    status: published ? "published" : "draft",
    sortOrder: Number.isFinite(root.sortOrder) ? Number(root.sortOrder) : 0,
    clientName: str(root.clientName, "clientName"),
    clientUrl: url(root.clientUrl, "clientUrl"),
    industry: str(root.industry, "industry"),
    timeframe: str(root.timeframe, "timeframe"),
    budget: str(root.budget, "budget"),
    channels: arr(root.channels ?? [], "channels", 20).map((v, i) =>
      str(v, `channels.${i}`),
    ),
    cover: image(root.cover, "cover"),
    logo: image(root.logo, "logo"),
    cta:
      root.cta == null
        ? undefined
        : {
            heading: str(c.heading, "cta.heading", 200, published),
            text: str(c.text, "cta.text", 2000),
            buttonText: str(c.buttonText, "cta.buttonText", 80, published),
            buttonUrl: url(c.buttonUrl, "cta.buttonUrl", published),
          },
  };
  if (Object.keys(errors).length) throw new StoryValidationError(errors);
  return result;
}
