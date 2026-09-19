/** Prepare the unique slug index without changing or deleting any records. */
export async function prepareCaseStudyIndex(collection) {
  const collisions = await collection
    .aggregate([
      { $group: { _id: "$slug", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
    ])
    .toArray();
  if (collisions.length) {
    throw new Error(
      `Resolve duplicate case-study slugs before creating the index: ${collisions.map((item) => `${item._id} (${item.count} records)`).join(", ")}`,
    );
  }
  await collection.createIndex(
    { slug: 1 },
    { unique: true, name: "case_study_slug_unique" },
  );
}
