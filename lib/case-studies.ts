import { ObjectId, type Filter } from "mongodb";

import { getMongoDb } from "@/lib/mongodb";

export type CaseStudyMetric = {
  value: string;
  label: string;
};

export type CaseStudyStatus = "draft" | "published";

export type CaseStudy = {
  id?: string;
  slug: string;
  title: string;
  category: string;
  headline: string;
  summary: string;
  challenge: string;
  solution: string;
  outcomes: string[];
  metrics: CaseStudyMetric[];
  sortOrder: number;
  status: CaseStudyStatus;
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean;
};

export type CaseStudyInput = {
  slug: string;
  title: string;
  category: string;
  headline: string;
  summary: string;
  challenge: string;
  solution: string;
  outcomes: string[];
  metrics: CaseStudyMetric[];
  sortOrder: number;
  status: CaseStudyStatus;
};

type CaseStudyDocument = Omit<CaseStudy, "id" | "isDefault"> & {
  _id: ObjectId | string;
};

type CaseStudyCollection = {
  deleteOne(query: Filter<CaseStudyDocument> | Record<string, unknown>): Promise<{
    deletedCount?: number;
  }>;
  find(query?: Filter<CaseStudyDocument> | Record<string, unknown>): {
    sort(sortSpec: Record<string, 1 | -1>): {
      toArray(): Promise<CaseStudyDocument[]>;
    };
  };
  findOne(
    query: Filter<CaseStudyDocument> | Record<string, unknown>,
  ): Promise<CaseStudyDocument | null>;
  findOneAndUpdate(
    query: Filter<CaseStudyDocument> | Record<string, unknown>,
    update: { $set: Partial<CaseStudyDocument> },
    options: { returnDocument: "after"; upsert?: boolean },
  ): Promise<CaseStudyDocument | null>;
  insertOne(document: CaseStudyDocument): Promise<{ insertedId: unknown }>;
};

type CaseStudyDb = {
  collection: (name: string) => unknown;
};

const COLLECTION = "caseStudies";
const DEFAULT_CREATED_AT = new Date("2026-05-01T00:00:00.000Z");

function withDefaultMeta(
  study: Omit<CaseStudy, "createdAt" | "isDefault" | "sortOrder" | "status" | "updatedAt">,
  sortOrder: number,
): CaseStudy {
  return {
    ...study,
    createdAt: DEFAULT_CREATED_AT,
    isDefault: true,
    sortOrder,
    status: "published",
    updatedAt: DEFAULT_CREATED_AT,
  };
}

export const defaultCaseStudies: CaseStudy[] = [
  withDefaultMeta(
    {
      slug: "comment-awareness-sprint",
      title: "Comment Awareness Sprint",
      category: "Awareness",
      headline: "100-140 targeted comments per month",
      summary:
        "A focused comment campaign built to show up in relevant Reddit, Quora, and X conversations.",
      challenge:
        "The brand needed early awareness without committing to a large paid media or agency program.",
      solution:
        "Lumivale mapped relevant threads, shaped simple talking points, and supported consistent comment activity.",
      outcomes: [
        "Clearer channel focus",
        "Consistent conversation coverage",
        "More repeatable awareness activity",
      ],
      metrics: [
        { value: "100-140", label: "comments per month" },
        { value: "8", label: "optional monthly posts" },
      ],
    },
    1,
  ),
  withDefaultMeta(
    {
      slug: "creator-content-launch",
      title: "Creator Content Launch",
      category: "Content",
      headline: "30-60 short-form videos per month",
      summary:
        "A UGC and creator collaboration setup designed to increase content output around a young brand.",
      challenge:
        "The team needed more short-form content and creator coverage without building an internal media operation.",
      solution:
        "Lumivale structured UGC publishing and creator collaboration outreach around clear monthly activity.",
      outcomes: [
        "Defined content cadence",
        "Creator outreach pipeline",
        "Brand-specific publishing focus",
      ],
      metrics: [
        { value: "30-60", label: "short-form videos" },
        { value: "5-10", label: "creator collaboration deals" },
      ],
    },
    2,
  ),
  withDefaultMeta(
    {
      slug: "outbound-pipeline-setup",
      title: "Outbound Pipeline Setup",
      category: "Outbound",
      headline: "LinkedIn and B2B email activity in one system",
      summary:
        "A LinkedIn and B2B email campaign structure for direct communication with targeted users.",
      challenge:
        "The team needed a practical outbound system with clear targeting, setup, and daily activity.",
      solution:
        "Lumivale organized LinkedIn outreach, inbox setup, domains, lead generation, and email sending structure.",
      outcomes: [
        "Targeted outreach foundation",
        "Cleaner inbox and domain setup",
        "Repeatable direct communication",
      ],
      metrics: [
        { value: "15-20/day", label: "LinkedIn connections" },
        { value: "60/day", label: "B2B emails sent" },
      ],
    },
    3,
  ),
];

function collection(db: CaseStudyDb) {
  return db.collection(COLLECTION) as CaseStudyCollection;
}

function normalizeSlug(slug: string) {
  return slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeInput(input: CaseStudyInput): CaseStudyInput {
  return {
    category: input.category.trim(),
    challenge: input.challenge.trim(),
    headline: input.headline.trim(),
    metrics: input.metrics
      .map((metric) => ({
        label: metric.label.trim(),
        value: metric.value.trim(),
      }))
      .filter((metric) => metric.label || metric.value),
    outcomes: input.outcomes.map((outcome) => outcome.trim()).filter(Boolean),
    slug: normalizeSlug(input.slug || input.title),
    solution: input.solution.trim(),
    sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
    status: input.status === "published" ? "published" : "draft",
    summary: input.summary.trim(),
    title: input.title.trim(),
  };
}

function validateInput(input: CaseStudyInput) {
  if (
    !input.slug ||
    !input.title ||
    !input.category ||
    !input.headline ||
    !input.summary ||
    !input.challenge ||
    !input.solution
  ) {
    throw new Error("Slug, title, category, headline, summary, challenge, and solution are required.");
  }

  if (!input.outcomes.length) {
    throw new Error("Add at least one outcome.");
  }

  if (!input.metrics.length || input.metrics.some((metric) => !metric.value || !metric.label)) {
    throw new Error("Add at least one complete metric.");
  }
}

function toCaseStudy(document: CaseStudyDocument): CaseStudy {
  return {
    ...document,
    id: String(document._id),
    isDefault: defaultCaseStudies.some((study) => study.slug === document.slug),
  };
}

function sortCaseStudies(studies: CaseStudy[]) {
  return [...studies].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return left.createdAt.getTime() - right.createdAt.getTime();
  });
}

function mergeWithDefaults(documents: CaseStudyDocument[]) {
  const merged = new Map(defaultCaseStudies.map((study) => [study.slug, study]));

  documents.map(toCaseStudy).forEach((study) => {
    const defaultStudy = merged.get(study.slug);

    merged.set(study.slug, {
      ...defaultStudy,
      ...study,
      isDefault: Boolean(defaultStudy),
    });
  });

  return sortCaseStudies([...merged.values()]);
}

function parseDelimitedLines(
  value: string,
  expectedParts: number,
  errorMessage: string,
) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map((part) => part.trim());

      if (parts.length !== expectedParts || parts.some((part) => !part)) {
        throw new Error(errorMessage);
      }

      return parts;
    });
}

export function parseCaseStudyFormData(formData: FormData): CaseStudyInput {
  const metrics = parseDelimitedLines(
    String(formData.get("metrics") ?? ""),
    2,
    "Metrics must use: Value | Label.",
  ).map(([value, label]) => ({ label, value }));

  return normalizeInput({
    category: String(formData.get("category") ?? ""),
    challenge: String(formData.get("challenge") ?? ""),
    headline: String(formData.get("headline") ?? ""),
    metrics,
    outcomes: String(formData.get("outcomes") ?? "").split(/\r?\n/),
    slug: String(formData.get("slug") ?? ""),
    solution: String(formData.get("solution") ?? ""),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    status: formData.get("status") === "published" ? "published" : "draft",
    summary: String(formData.get("summary") ?? ""),
    title: String(formData.get("title") ?? ""),
  });
}

export function getDefaultCaseStudies() {
  return defaultCaseStudies;
}

export function getAllCaseStudies() {
  return getDefaultCaseStudies();
}

export function getCaseStudyBySlug(slug: string) {
  return defaultCaseStudies.find((study) => study.slug === slug);
}

export async function getAdminCaseStudies(db: CaseStudyDb) {
  const studies = await collection(db).find({}).sort({ sortOrder: 1 }).toArray();

  return mergeWithDefaults(studies);
}

export async function getPublishedCaseStudies(db: CaseStudyDb) {
  const studies = await getAdminCaseStudies(db);

  return studies.filter((study) => study.status === "published");
}

export async function getAdminCaseStudyBySlug(db: CaseStudyDb, slug: string) {
  const normalizedSlug = normalizeSlug(slug);
  const document = await collection(db).findOne({ slug: normalizedSlug });
  const defaultStudy = getCaseStudyBySlug(normalizedSlug);

  if (!document) {
    return defaultStudy ?? null;
  }

  return mergeWithDefaults([document]).find((study) => study.slug === normalizedSlug) ?? null;
}

export async function getPublishedCaseStudyBySlug(db: CaseStudyDb, slug: string) {
  const study = await getAdminCaseStudyBySlug(db, slug);

  return study?.status === "published" ? study : null;
}

export async function getPublishedCaseStudiesForSite() {
  try {
    const db = await getMongoDb();

    return await getPublishedCaseStudies(db);
  } catch (error) {
    console.error("Unable to load case studies", error);

    return defaultCaseStudies.filter((study) => study.status === "published");
  }
}

export async function getPublishedCaseStudyBySlugForSite(slug: string) {
  try {
    const db = await getMongoDb();

    return await getPublishedCaseStudyBySlug(db, slug);
  } catch (error) {
    console.error("Unable to load case study", error);

    const study = getCaseStudyBySlug(slug);

    return study?.status === "published" ? study : null;
  }
}

export async function createCaseStudy(db: CaseStudyDb, input: CaseStudyInput) {
  const normalized = normalizeInput(input);

  validateInput(normalized);

  if (
    defaultCaseStudies.some((study) => study.slug === normalized.slug) ||
    (await collection(db).findOne({ slug: normalized.slug }))
  ) {
    throw new Error("A case study with this slug already exists.");
  }

  const now = new Date();
  const document: CaseStudyDocument = {
    ...normalized,
    _id: new ObjectId(),
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection(db).insertOne(document);

  return {
    ...document,
    id: String(result.insertedId),
  };
}

export async function updateCaseStudy(
  db: CaseStudyDb,
  slug: string,
  updates: Partial<CaseStudyInput>,
) {
  const current = await getAdminCaseStudyBySlug(db, slug);

  if (!current) {
    throw new Error("Case study not found.");
  }

  const next = normalizeInput({
    category: updates.category ?? current.category,
    challenge: updates.challenge ?? current.challenge,
    headline: updates.headline ?? current.headline,
    metrics: updates.metrics ?? current.metrics,
    outcomes: updates.outcomes ?? current.outcomes,
    slug: updates.slug ?? current.slug,
    solution: updates.solution ?? current.solution,
    sortOrder: updates.sortOrder ?? current.sortOrder,
    status: updates.status ?? current.status,
    summary: updates.summary ?? current.summary,
    title: updates.title ?? current.title,
  });

  validateInput(next);

  if (current.isDefault && next.slug !== current.slug) {
    throw new Error("Default case study slugs cannot be changed.");
  }

  if (next.slug !== current.slug) {
    const slugBelongsToDefault = defaultCaseStudies.some((study) => study.slug === next.slug);
    const existing = await collection(db).findOne({ slug: next.slug });

    if (slugBelongsToDefault || (existing && existing.slug !== current.slug)) {
      throw new Error("A case study with this slug already exists.");
    }
  }

  const existingDocument = await collection(db).findOne({ slug: current.slug });
  const now = new Date();
  const updated = await collection(db).findOneAndUpdate(
    { slug: current.slug },
    {
      $set: {
        ...next,
        createdAt: existingDocument?.createdAt ?? current.createdAt ?? now,
        updatedAt: now,
      },
    },
    { returnDocument: "after", upsert: true },
  );

  if (!updated) {
    throw new Error("Case study not found.");
  }

  return toCaseStudy(updated);
}

export async function deleteCaseStudy(db: CaseStudyDb, slug: string) {
  const normalizedSlug = normalizeSlug(slug);

  if (defaultCaseStudies.some((study) => study.slug === normalizedSlug)) {
    throw new Error("Default case studies can be unpublished, but not deleted.");
  }

  const result = await collection(db).deleteOne({ slug: normalizedSlug });

  if (result.deletedCount !== 1) {
    throw new Error("Case study not found.");
  }
}
