import { Readable } from "node:stream";

import { GridFSBucket, ObjectId } from "mongodb";
import { NextResponse } from "next/server";

import { getMongoDb } from "@/lib/mongodb";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    return new NextResponse("Image not found", { status: 404 });
  }

  const db = await getMongoDb();
  const bucket = new GridFSBucket(db, { bucketName: "blogImages" });
  const imageId = new ObjectId(id);
  const file = await db.collection("blogImages.files").findOne<{
    contentType?: string;
    metadata?: { contentType?: string };
  }>({ _id: imageId });

  if (!file) {
    return new NextResponse("Image not found", { status: 404 });
  }

  const stream = bucket.openDownloadStream(imageId);

  return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type":
        file.metadata?.contentType ?? file.contentType ?? "application/octet-stream",
    },
  });
}
