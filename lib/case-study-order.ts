import type { Db } from "mongodb";
import { getAdminCaseStudies } from "@/lib/case-studies";

export async function reorderCaseStudies(db: Db, order: unknown) {
  if (!Array.isArray(order) || order.some((slug) => typeof slug !== "string") || new Set(order).size !== order.length) {
    throw new Error("Provide each case study once in the new order.");
  }
  const studies = await getAdminCaseStudies(db);
  const bySlug = new Map(studies.map((study) => [study.slug, study]));
  if (order.length !== studies.length || order.some((slug) => !bySlug.has(slug))) {
    throw new Error("The case study list has changed. Refresh the page before reordering.");
  }
  if (!order.length) return;
  const now = new Date();
  await db.collection("caseStudies").bulkWrite(order.map((slug, index) => {
    const study = bySlug.get(slug)!;
    // Defaults may not have a stored document yet. Preserve their complete content on insert.
    const { id, isDefault, sortOrder, updatedAt, ...content } = study;
    void id; void isDefault; void sortOrder; void updatedAt;
    return { updateOne: { filter: { slug }, update: { $set: { sortOrder: index + 1, updatedAt: now }, $setOnInsert: content }, upsert: true } };
  }));
}
