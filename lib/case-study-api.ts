import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { parseStoryInput, StoryValidationError } from "@/lib/case-study-story";

export function checkStoryOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (
    (origin && origin !== new URL(request.url).origin) ||
    request.headers.get("sec-fetch-site") === "cross-site"
  ) {
    return NextResponse.json(
      { error: "This request must come from this website." },
      { status: 403 },
    );
  }
  return null;
}
export async function readStoryRequest(request: Request) {
  if (Number(request.headers.get("content-length")) > 1024 * 1024)
    throw new Error("Story must be 1 MiB or smaller.");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Missing story content.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 1024 * 1024) {
      await reader.cancel();
      throw new Error("Story must be 1 MiB or smaller.");
    }
    chunks.push(value);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return parseStoryInput(
    JSON.parse(raw),
    process.env.CLOUDINARY_CLOUD_NAME ?? "",
  );
}
export function storyApiError(error: unknown) {
  const duplicate =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000;
  return NextResponse.json(
    {
      error: duplicate
        ? "A case study with this slug already exists."
        : error instanceof Error
          ? error.message
          : "Could not save case study.",
      ...(error instanceof StoryValidationError
        ? { errors: error.errors }
        : {}),
    },
    { status: 400 },
  );
}
export function refreshCaseStudies(...slugs: string[]) {
  revalidatePath("/");
  revalidatePath("/case-studies");
  for (const slug of new Set(slugs)) revalidatePath(`/case-studies/${slug}`);
}
