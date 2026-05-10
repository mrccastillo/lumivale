import { ObjectId, type Filter } from "mongodb";

import { getMongoDb } from "@/lib/mongodb";

export type ServicePricingLine = {
  label: string;
  value: string;
};

export type ServiceExampleCard = {
  title: string;
  summary: string;
  tag: string;
  exampleType?: "link" | "photo";
  imageAlt?: string;
  imageFileId?: string;
  previewUrl?: string;
  videoDescription?: string;
  videoFileId?: string;
};

export type PrivateServiceContent = {
  exampleCards: ServiceExampleCard[];
  examplePlatform: string;
  heroDescription: string;
  pricePreview: string;
  pricingLines: ServicePricingLine[];
};

export type ServiceStatus = "draft" | "published";

export type Service = {
  id?: string;
  slug: string;
  title: string;
  summary: string;
  highlights: string[];
  description: string;
  privateContent: PrivateServiceContent;
  sortOrder: number;
  status: ServiceStatus;
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean;
};

export type ServiceInput = {
  title: string;
  summary: string;
  highlights: string[];
  description: string;
  privateContent: PrivateServiceContent;
  sortOrder: number;
  status: ServiceStatus;
};

type ServiceDocument = Omit<Service, "id" | "isDefault"> & {
  _id: ObjectId | string;
};

type ServiceCollection = {
  deleteOne(query: Filter<ServiceDocument> | Record<string, unknown>): Promise<{
    deletedCount?: number;
  }>;
  find(query?: Filter<ServiceDocument> | Record<string, unknown>): {
    sort(sortSpec: Record<string, 1 | -1>): {
      toArray(): Promise<ServiceDocument[]>;
    };
  };
  findOne(
    query: Filter<ServiceDocument> | Record<string, unknown>,
  ): Promise<ServiceDocument | null>;
  findOneAndUpdate(
    query: Filter<ServiceDocument> | Record<string, unknown>,
    update: { $set: Partial<ServiceDocument> },
    options: { returnDocument: "after"; upsert?: boolean },
  ): Promise<ServiceDocument | null>;
  insertOne(document: ServiceDocument): Promise<{ insertedId: unknown }>;
};

type ServiceDb = {
  collection: (name: string) => unknown;
};

const COLLECTION = "services";
const DEFAULT_CREATED_AT = new Date("2026-05-01T00:00:00.000Z");
export const SERVICE_EXAMPLE_VIDEO_MAX_BYTES = 50 * 1024 * 1024;
export const SERVICE_EXAMPLE_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);
export const SERVICE_EXAMPLE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const SERVICE_EXAMPLE_IMAGE_TYPES = new Set([
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function withDefaultMeta(
  service: Omit<Service, "createdAt" | "isDefault" | "sortOrder" | "status" | "updatedAt">,
  sortOrder: number,
): Service {
  return {
    ...service,
    createdAt: DEFAULT_CREATED_AT,
    isDefault: true,
    sortOrder,
    status: "published",
    updatedAt: DEFAULT_CREATED_AT,
  };
}

export const defaultServices: Service[] = [
  withDefaultMeta(
    {
      slug: "comment-campaign",
      title: "Comment Campaign",
      summary:
        "Post targeted comments on relevant Reddit, Quora, and X threads to build awareness and bring more interested users back to your site.",
      highlights: [
        "Relevant Reddit, Quora, and X conversations",
        "100 comments + 8 posts or 200 comments + 20 posts",
        "User awareness and website traffic support",
      ],
      description:
        "Posting targeted comments on relevant Reddit, Quora, and X threads (100-140 comments/mo) or (100 comments + 8 posts/mo) to increase user awareness and website traffic (SEO).",
      privateContent: {
        examplePlatform: "Reddit",
        heroDescription:
          "Posting targeted comments on relevant Reddit, Quora, and X threads (100-140 comments/mo) or (100 comments + 8 posts/mo) to increase user awareness and website traffic (SEO).",
        pricePreview: "Starting at $850/mo",
        pricingLines: [
          { label: "Monthly rate for 100 comments + 8 posts", value: "$850" },
          { label: "Monthly rate for 200 comments + 20 posts", value: "$1450" },
        ],
        exampleCards: [
          {
          title: "Reddit thread reply",
          summary: "Answer product-relevant questions with a clear CTA back to the site.",
          tag: "Awareness",
          exampleType: "link",
          imageAlt: "",
          imageFileId: "",
          previewUrl: "",
          videoDescription: "",
          videoFileId: "",
        },
        {
          title: "Quora answer placement",
          summary: "Publish useful long-form responses in intent-rich category threads.",
          tag: "Traffic",
          exampleType: "link",
          imageAlt: "",
          imageFileId: "",
          previewUrl: "",
          videoDescription: "",
          videoFileId: "",
        },
        {
          title: "X conversation post",
          summary: "Enter live industry conversations with comments that feel native.",
          tag: "Social proof",
          exampleType: "link",
          imageAlt: "",
          imageFileId: "",
          previewUrl: "",
          videoDescription: "",
          videoFileId: "",
        },
        ],
      },
    },
    1,
  ),
  withDefaultMeta(
    {
      slug: "ugc-content-creation",
      title: "UGC Content Creation",
      summary:
        "Publish 30-60 short-form videos each month on YouTube Shorts and TikTok through brand-specific content accounts.",
      highlights: [
        "30-60 short-form videos per month",
        "YouTube Shorts and TikTok publishing",
        "Brand-specific content accounts for distribution",
      ],
      description:
        "Publishing 30-60 short-form videos per month on YouTube Shorts and Tiktok to get traction and high performance with US/EU audiences. Content will be posted on new brand-specific accounts.",
      privateContent: {
        examplePlatform: "TikTok",
        heroDescription:
          "Publishing 30-60 short-form videos per month on Youtube Shorts and Tiktok to get traction and high performance with US/EU audiences. Content will be posted on new brand-specific accounts.",
        pricePreview: "Starting at $850/mo",
        pricingLines: [
          { label: "Monthly rate for 30 contents", value: "$850" },
          { label: "Monthly rate for 60 contents", value: "$1450" },
        ],
        exampleCards: [
          {
          title: "Hook-first TikTok",
          summary: "Quick opener, native pacing, and product angle tuned for retention.",
          tag: "UGC",
          exampleType: "link",
          imageAlt: "",
          imageFileId: "",
          previewUrl: "",
          videoDescription: "",
          videoFileId: "",
        },
        {
          title: "Shorts repost system",
          summary: "Reuse the winning concept across YouTube Shorts and TikTok safely.",
          tag: "Distribution",
          exampleType: "link",
          imageAlt: "",
          imageFileId: "",
          previewUrl: "",
          videoDescription: "",
          videoFileId: "",
        },
        {
          title: "Creator-style screen demo",
          summary: "Blend product footage with casual narration for a less polished look.",
          tag: "Testing",
          exampleType: "link",
          imageAlt: "",
          imageFileId: "",
          previewUrl: "",
          videoDescription: "",
          videoFileId: "",
        },
        ],
      },
    },
    2,
  ),
  withDefaultMeta(
    {
      slug: "creator-collabs",
      title: "Creator Collabs",
      summary:
        "Manage 5-10 creator collaboration deals across YouTube, LinkedIn, X, and TikTok to release dedicated content around your brand.",
      highlights: [
        "5-10 creator collaboration deals",
        "YouTube, LinkedIn, X, and TikTok coverage",
        "Client handles creator payments directly",
      ],
      description:
        "Managing and closing 5-10 collaboration deals with creators on YouTube, LinkedIn, X, and TikTok to release dedicated media content surrounding your brand with our creative partners or other creators. You will handle creator payments directly.",
      privateContent: {
        examplePlatform: "TikTok",
        heroDescription:
          "Managing and closing 5-10 collaboration deals with creators on YouTube, LinkedIn, X, and TikTok to release dedicated media content surrounding your brand with our creative partners or other creators. You will handle creator payments directly.",
        pricePreview: "$850/mo + creator fees",
        pricingLines: [
          { label: "Monthly rate", value: "$850" },
          {
            label: "Creator's payment",
            value: "$1,000-$4,000 for total of 5-10 deals",
          },
        ],
        exampleCards: [
          {
          title: "Creator shortlist",
          summary: "Match channels and audience fit before sending any outreach.",
          tag: "Sourcing",
          exampleType: "link",
          imageAlt: "",
          imageFileId: "",
          previewUrl: "",
          videoDescription: "",
          videoFileId: "",
        },
        {
          title: "Deal coordination",
          summary: "Handle messaging, negotiation, and posting windows for launch timing.",
          tag: "Execution",
          exampleType: "link",
          imageAlt: "",
          imageFileId: "",
          previewUrl: "",
          videoDescription: "",
          videoFileId: "",
        },
        {
          title: "Content delivery",
          summary: "Ensure every creator piece lands with the right angle and brand mention.",
          tag: "Publishing",
          exampleType: "link",
          imageAlt: "",
          imageFileId: "",
          previewUrl: "",
          videoDescription: "",
          videoFileId: "",
        },
        ],
      },
    },
    3,
  ),
  withDefaultMeta(
    {
      slug: "linkedin-outreaching",
      title: "LinkedIn Outreaching",
      summary:
        "Manage executive LinkedIn accounts to create more calls and sign-ups through targeted outreach.",
      highlights: [
        "Executive LinkedIn account management",
        "15-20 industry-specific connections per day",
        "400+ targeted connections each month",
      ],
      description:
        "Managing executive LinkedIn accounts to generate calls and sign-ups through targeted outreach. Establishing 15-20 industry specific connections/day (400+ connections/mo).",
      privateContent: {
        examplePlatform: "LinkedIn",
        heroDescription:
          "Managing executive LinkedIn accounts to generate calls and sign-ups through targeted outreach. Establishing 15-20 industry specific connections/day (400+ connections/mo).",
        pricePreview: "$850/mo",
        pricingLines: [{ label: "Monthly rate", value: "$850" }],
        exampleCards: [
          {
          title: "Connection targeting",
          summary: "Build a repeatable targeting list around role, niche, and buying intent.",
          tag: "Prospecting",
          exampleType: "link",
          imageAlt: "",
          imageFileId: "",
          previewUrl: "",
          videoDescription: "",
          videoFileId: "",
        },
        {
          title: "Message sequencing",
          summary: "Keep outreach simple, conversational, and positioned for replies.",
          tag: "Messaging",
          exampleType: "link",
          imageAlt: "",
          imageFileId: "",
          previewUrl: "",
          videoDescription: "",
          videoFileId: "",
        },
        {
          title: "Lead handoff",
          summary: "Surface warm replies into your call booking or sign-up flow quickly.",
          tag: "Pipeline",
          exampleType: "link",
          imageAlt: "",
          imageFileId: "",
          previewUrl: "",
          videoDescription: "",
          videoFileId: "",
        },
        ],
      },
    },
    4,
  ),
  withDefaultMeta(
    {
      slug: "email-b2b-campaigns",
      title: "Email B2B Campaigns",
      summary:
        "Launch a structured B2B email campaign with inbox setup, domains, lead generation, and 60 emails per day.",
      highlights: [
        "Inbox and domain setup for campaign sending",
        "Lead generation and list preparation",
        "60 emails per day, around 1,000 emails per month",
      ],
      description:
        "Launching a structured email campaign targeting multiple inboxes for direct communication with users. This includes setup of inboxes and domains, lead generation, and sending 60 emails/day (around 1000 emails/mo).",
      privateContent: {
        examplePlatform: "Email",
        heroDescription:
          "Launching a structured email campaign targeting multiple inboxes for direct communication with users. This includes setup of inboxes and domains, lead generation, and sending 60 emails/day (around 1000 emails/mo).",
        pricePreview: "$1000/mo",
        pricingLines: [{ label: "Monthly rate", value: "$1000" }],
        exampleCards: [
          {
          title: "Inbox setup",
          summary: "Prepare domains and inboxes so the campaign can start with a clean base.",
          tag: "Setup",
          exampleType: "link",
          imageAlt: "",
          imageFileId: "",
          previewUrl: "",
          videoDescription: "",
          videoFileId: "",
        },
        {
          title: "Lead list building",
          summary: "Source targeted contacts before the first outreach sequence goes live.",
          tag: "Leads",
          exampleType: "link",
          imageAlt: "",
          imageFileId: "",
          previewUrl: "",
          videoDescription: "",
          videoFileId: "",
        },
        {
          title: "Outbound cadence",
          summary: "Send controlled daily volume with message variants for reply testing.",
          tag: "Sending",
          exampleType: "link",
          imageAlt: "",
          imageFileId: "",
          previewUrl: "",
          videoDescription: "",
          videoFileId: "",
        },
        ],
      },
    },
    5,
  ),
];

function collection(db: ServiceDb) {
  return db.collection(COLLECTION) as ServiceCollection;
}

function toService(document: ServiceDocument): Service {
  return {
    ...document,
    id: String(document._id),
    isDefault: defaultServices.some((service) => service.slug === document.slug),
  };
}

function sortServices(services: Service[]) {
  return [...services].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return left.createdAt.getTime() - right.createdAt.getTime();
  });
}

function mergeWithDefaults(documents: ServiceDocument[]) {
  const merged = new Map(defaultServices.map((service) => [service.slug, service]));

  documents.map(toService).forEach((service) => {
    const defaultService = merged.get(service.slug);

    merged.set(service.slug, {
      ...defaultService,
      ...service,
      privateContent: {
        ...(defaultService?.privateContent ?? {}),
        ...service.privateContent,
      },
      isDefault: Boolean(defaultService),
    });
  });

  return sortServices([...merged.values()]);
}

function normalizeInput(input: ServiceInput): ServiceInput {
  return {
    title: input.title.trim(),
    summary: input.summary.trim(),
    description: input.description.trim(),
    highlights: input.highlights.map((highlight) => highlight.trim()).filter(Boolean),
    sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
    status: input.status === "published" ? "published" : "draft",
    privateContent: {
      examplePlatform: input.privateContent.examplePlatform.trim(),
      heroDescription: input.privateContent.heroDescription.trim(),
      pricePreview: input.privateContent.pricePreview.trim(),
      pricingLines: input.privateContent.pricingLines
        .map((line) => ({
          label: line.label.trim(),
          value: line.value.trim(),
        }))
        .filter((line) => line.label || line.value),
      exampleCards: input.privateContent.exampleCards
        .map((card) => ({
          title: card.title.trim(),
          summary: card.summary.trim(),
          tag: card.tag.trim(),
          exampleType: card.exampleType === "photo" ? ("photo" as const) : ("link" as const),
          imageAlt: (card.imageAlt ?? "").trim(),
          imageFileId: (card.imageFileId ?? "").trim(),
          previewUrl: normalizeOptionalUrl(card.previewUrl ?? ""),
          videoDescription: (card.videoDescription ?? "").trim(),
          videoFileId: (card.videoFileId ?? "").trim(),
        }))
        .filter(
          (card) =>
            card.title ||
            card.summary ||
            card.tag ||
            card.imageAlt ||
            card.imageFileId ||
            card.previewUrl ||
            card.videoDescription ||
            card.videoFileId,
        ),
    },
  };
}

function normalizeOptionalUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  try {
    const url = new URL(trimmed);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Preview links must start with http:// or https://.");
    }

    return url.toString();
  } catch {
    throw new Error("Preview links must be valid URLs.");
  }
}

function validateInput(input: ServiceInput) {
  if (!input.title || !input.summary || !input.description) {
    throw new Error("Title, summary, and description are required.");
  }

  if (!input.highlights.length) {
    throw new Error("Add at least one service highlight.");
  }

  if (
    !input.privateContent.heroDescription ||
    !input.privateContent.pricePreview ||
    !input.privateContent.examplePlatform
  ) {
    throw new Error("Private pricing summary, price preview, and platform are required.");
  }

  if (
    !input.privateContent.pricingLines.length ||
    input.privateContent.pricingLines.some((line) => !line.label || !line.value)
  ) {
    throw new Error("Add at least one complete pricing line.");
  }

  if (
    input.privateContent.exampleCards.some(
      (card) => !card.title || !card.tag || !card.summary,
    )
  ) {
    throw new Error("Example cards must include title, tag, and summary.");
  }

  if (
    input.privateContent.exampleCards.some(
      (card) => card.exampleType === "link" && !card.previewUrl,
    )
  ) {
    throw new Error("Link examples require a preview link.");
  }

  if (
    input.privateContent.exampleCards.some(
      (card) => card.exampleType === "photo" && !card.imageFileId,
    )
  ) {
    throw new Error("Photo examples require an uploaded photo.");
  }
}

export function validateServiceExampleImageFile(file: File | null) {
  if (!file || file.size === 0) {
    return null;
  }

  if (!SERVICE_EXAMPLE_IMAGE_TYPES.has(file.type)) {
    return "Example photo must be a PNG, JPG, WEBP, or GIF.";
  }

  if (file.size > SERVICE_EXAMPLE_IMAGE_MAX_BYTES) {
    return "Example photo must be 5MB or smaller.";
  }

  return null;
}

export function validateServiceExampleVideoFile(file: File | null) {
  if (!file || file.size === 0) {
    return null;
  }

  if (!SERVICE_EXAMPLE_VIDEO_TYPES.has(file.type)) {
    return "Example video must be an MP4, WEBM, or MOV file.";
  }

  if (file.size > SERVICE_EXAMPLE_VIDEO_MAX_BYTES) {
    return "Example video must be 50MB or smaller.";
  }

  return null;
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

export function parseServiceFormData(formData: FormData): ServiceInput {
  const pricingLines = parseDelimitedLines(
    String(formData.get("pricingLines") ?? ""),
    2,
    "Pricing lines must use: Label | Value.",
  ).map(([label, value]) => ({ label, value }));
  const exampleCards = parseExampleCardFormData(formData);

  return normalizeInput({
    title: String(formData.get("title") ?? ""),
    summary: String(formData.get("summary") ?? ""),
    description: String(formData.get("description") ?? ""),
    highlights: String(formData.get("highlights") ?? "").split(/\r?\n/),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    status: formData.get("status") === "published" ? "published" : "draft",
    privateContent: {
      examplePlatform: String(formData.get("examplePlatform") ?? ""),
      heroDescription: String(formData.get("heroDescription") ?? ""),
      pricePreview: String(formData.get("pricePreview") ?? ""),
      pricingLines,
      exampleCards,
    },
  });
}

function parseExampleCardFormData(formData: FormData) {
  const indexedCards = Array.from({ length: 6 }, (_, index) => ({
    exampleType: formData.get(`exampleCardType-${index}`) === "photo" ? "photo" : "link",
    imageAlt: String(formData.get(`exampleCardImageAlt-${index}`) ?? ""),
    imageFileId: String(formData.get(`exampleCardImageFileId-${index}`) ?? ""),
    title: String(formData.get(`exampleCardTitle-${index}`) ?? ""),
    tag: String(formData.get(`exampleCardTag-${index}`) ?? ""),
    summary: String(formData.get(`exampleCardSummary-${index}`) ?? ""),
    previewUrl: String(formData.get(`exampleCardPreviewUrl-${index}`) ?? ""),
    videoDescription: String(formData.get(`exampleCardVideoDescription-${index}`) ?? ""),
    videoFileId: String(formData.get(`exampleCardVideoFileId-${index}`) ?? ""),
  })).filter(
    (card) =>
      card.title ||
      card.tag ||
      card.summary ||
      card.imageAlt ||
      card.imageFileId ||
      card.previewUrl ||
      card.videoDescription ||
      card.videoFileId,
  );

  if (indexedCards.length) {
    return indexedCards;
  }

  return parseDelimitedLines(
    String(formData.get("exampleCards") ?? ""),
    3,
    "Example cards must use: Title | Tag | Summary.",
  ).map(([title, tag, summary]) => ({ summary, tag, title }));
}

function slugify(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "service";
}

async function uniqueSlug(db: ServiceDb, title: string) {
  const baseSlug = slugify(title);
  const existingDefaultSlugs = new Set(defaultServices.map((service) => service.slug));
  let candidate = baseSlug;
  let suffix = 2;

  while (
    existingDefaultSlugs.has(candidate) ||
    (await collection(db).findOne({ slug: candidate }))
  ) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function documentForCreate(slug: string, input: ServiceInput, now: Date): ServiceDocument {
  return {
    ...input,
    _id: new ObjectId(),
    slug,
    createdAt: now,
    updatedAt: now,
  };
}

function idFilter(id: string): Filter<ServiceDocument> {
  return ObjectId.isValid(id)
    ? ({ _id: new ObjectId(id) } as Filter<ServiceDocument>)
    : ({ _id: id } as Filter<ServiceDocument>);
}

export function getDefaultServices() {
  return defaultServices;
}

export function getAllServices() {
  return getDefaultServices();
}

export function getServiceBySlug(slug: string) {
  return defaultServices.find((service) => service.slug === slug);
}

export async function getAdminServices(db: ServiceDb) {
  const services = await collection(db).find({}).sort({ sortOrder: 1 }).toArray();

  return mergeWithDefaults(services);
}

export async function getPublishedServices(db: ServiceDb) {
  const services = await getAdminServices(db);

  return services.filter((service) => service.status === "published");
}

export async function getAdminServiceBySlug(db: ServiceDb, slug: string) {
  const document = await collection(db).findOne({ slug });
  const defaultService = getServiceBySlug(slug);

  if (!document) {
    return defaultService ?? null;
  }

  return mergeWithDefaults([document]).find((service) => service.slug === slug) ?? null;
}

export async function getPublishedServiceBySlug(db: ServiceDb, slug: string) {
  const service = await getAdminServiceBySlug(db, slug);

  return service?.status === "published" ? service : null;
}

export async function getPublishedServicesForSite() {
  try {
    const db = await getMongoDb();

    return await getPublishedServices(db);
  } catch (error) {
    console.error("Unable to load services", error);

    return defaultServices.filter((service) => service.status === "published");
  }
}

export async function getPublishedServiceBySlugForSite(slug: string) {
  try {
    const db = await getMongoDb();

    return await getPublishedServiceBySlug(db, slug);
  } catch (error) {
    console.error("Unable to load service", error);

    const service = getServiceBySlug(slug);

    return service?.status === "published" ? service : null;
  }
}

export async function createService(db: ServiceDb, input: ServiceInput) {
  const normalized = normalizeInput(input);

  validateInput(normalized);

  const now = new Date();
  const slug = await uniqueSlug(db, normalized.title);
  const document = documentForCreate(slug, normalized, now);
  const result = await collection(db).insertOne(document);

  return {
    ...document,
    id: String(result.insertedId),
  };
}

export async function updateService(
  db: ServiceDb,
  slug: string,
  updates: Partial<ServiceInput>,
) {
  const current = await getAdminServiceBySlug(db, slug);

  if (!current) {
    throw new Error("Service not found.");
  }

  const next = normalizeInput({
    title: updates.title ?? current.title,
    summary: updates.summary ?? current.summary,
    description: updates.description ?? current.description,
    highlights: updates.highlights ?? current.highlights,
    sortOrder: updates.sortOrder ?? current.sortOrder,
    status: updates.status ?? current.status,
    privateContent: updates.privateContent ?? current.privateContent,
  });

  validateInput(next);

  const existingDocument = await collection(db).findOne({ slug });
  const now = new Date();
  const updated = await collection(db).findOneAndUpdate(
    { slug },
    {
      $set: {
        ...next,
        createdAt: existingDocument?.createdAt ?? current.createdAt ?? now,
        slug,
        updatedAt: now,
      },
    },
    { returnDocument: "after", upsert: true },
  );

  if (!updated) {
    throw new Error("Service not found.");
  }

  return toService(updated);
}

export async function deleteService(db: ServiceDb, slug: string) {
  if (defaultServices.some((service) => service.slug === slug)) {
    throw new Error("Default services can be unpublished, but not deleted.");
  }

  const current = await collection(db).findOne({ slug });

  if (!current) {
    throw new Error("Service not found.");
  }

  const result = await collection(db).deleteOne(idFilter(String(current._id)));

  if (result.deletedCount !== 1) {
    throw new Error("Service not found.");
  }
}
