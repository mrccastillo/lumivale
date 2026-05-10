import { describe, expect, test } from "vitest";

import {
  createTestimonial,
  deleteTestimonial,
  getAdminTestimonials,
  getPublishedTestimonials,
  updateTestimonial,
  validateTestimonialVideoFile,
} from "@/lib/testimonials";

describe("testimonial repository", () => {
  test("creates, publishes, sorts, updates, and deletes testimonials", async () => {
    const db = createTestDb();

    const text = await createTestimonial(db, {
      personName: "Maya Lee",
      personTitle: "Founder, Northstar",
      quote: "Lumivale made growth activity simpler to repeat.",
      sortOrder: 2,
      status: "draft",
      type: "text",
      videoUrl: "",
    });
    const video = await createTestimonial(db, {
      personName: "Jon Ramos",
      personTitle: "CEO, Signal Labs",
      quote: "The execution support helped us move faster.",
      sortOrder: 1,
      status: "published",
      type: "video",
      videoUrl: "https://res.cloudinary.com/demo/video/upload/video-1.mp4",
    });

    await expect(getPublishedTestimonials(db)).resolves.toEqual([
      expect.objectContaining({ id: video.id, type: "video" }),
    ]);

    const publishedText = await updateTestimonial(db, text.id, {
      status: "published",
    });

    await expect(getPublishedTestimonials(db)).resolves.toEqual([
      expect.objectContaining({ id: video.id, sortOrder: 1 }),
      expect.objectContaining({ id: publishedText.id, sortOrder: 2 }),
    ]);

    await updateTestimonial(db, video.id, {
      quote: "Updated quote.",
      type: "text",
      videoUrl: "",
    });

    await expect(getAdminTestimonials(db)).resolves.toContainEqual(
      expect.objectContaining({
        id: video.id,
        quote: "Updated quote.",
        type: "text",
        videoUrl: "",
      }),
    );

    await deleteTestimonial(db, text.id);

    await expect(getAdminTestimonials(db)).resolves.toHaveLength(1);
  });

  test("requires video testimonials to include a video URL", async () => {
    const db = createTestDb();

    await expect(
      createTestimonial(db, {
        personName: "Maya Lee",
        personTitle: "Founder",
        quote: "A strong result.",
        sortOrder: 1,
        status: "published",
        type: "video",
        videoUrl: "",
      }),
    ).rejects.toThrow("Video testimonials require a video file.");
  });

  test("validates uploaded testimonial video files", () => {
    const validVideo = new File(["video"], "clip.mp4", { type: "video/mp4" });
    const invalidVideo = new File(["video"], "clip.txt", { type: "text/plain" });
    const largeVideo = new File([new Uint8Array(50 * 1024 * 1024 + 1)], "clip.mp4", {
      type: "video/mp4",
    });

    expect(validateTestimonialVideoFile(validVideo)).toBeNull();
    expect(validateTestimonialVideoFile(invalidVideo)).toBe(
      "Testimonial video must be an MP4, WEBM, or MOV file.",
    );
    expect(validateTestimonialVideoFile(largeVideo)).toBe(
      "Testimonial video must be 50MB or smaller.",
    );
  });
});

function createTestDb() {
  const documents: Record<string, unknown>[] = [];

  return {
    collection() {
      return {
        async findOne(query: Record<string, unknown>) {
          return documents.find((document) => matches(document, query)) ?? null;
        },
        async insertOne(document: Record<string, unknown>) {
          documents.push({ ...document, _id: `testimonial-${documents.length + 1}` });
          return { insertedId: documents[documents.length - 1]._id };
        },
        find(query: Record<string, unknown> = {}) {
          const found = documents.filter((document) => matches(document, query));

          return {
            sort(sortSpec: Record<string, 1 | -1>) {
              found.sort((left, right) => {
                for (const [key, direction] of Object.entries(sortSpec)) {
                  const leftValue = left[key] as number | Date;
                  const rightValue = right[key] as number | Date;
                  const leftComparable = leftValue instanceof Date ? leftValue.getTime() : leftValue;
                  const rightComparable =
                    rightValue instanceof Date ? rightValue.getTime() : rightValue;

                  if (leftComparable === rightComparable) {
                    continue;
                  }

                  return leftComparable > rightComparable ? direction : -direction;
                }

                return 0;
              });

              return this;
            },
            async toArray() {
              return [...found];
            },
          };
        },
        async findOneAndUpdate(
          query: Record<string, unknown>,
          update: { $set: Record<string, unknown> },
          options: { returnDocument: "after" },
        ) {
          expect(options.returnDocument).toBe("after");
          const index = documents.findIndex((document) => matches(document, query));

          if (index === -1) {
            return null;
          }

          documents[index] = { ...documents[index], ...update.$set };

          return documents[index];
        },
        async deleteOne(query: Record<string, unknown>) {
          const index = documents.findIndex((document) => matches(document, query));

          if (index === -1) {
            return { deletedCount: 0 };
          }

          documents.splice(index, 1);
          return { deletedCount: 1 };
        },
      };
    },
  };
}

function matches(document: Record<string, unknown>, query: Record<string, unknown>) {
  return Object.entries(query).every(([key, value]) => document[key] === value);
}
