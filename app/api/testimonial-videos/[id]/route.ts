import { Readable } from "node:stream";

import { GridFSBucket, ObjectId } from "mongodb";
import { NextResponse } from "next/server";

import { getMongoDb } from "@/lib/mongodb";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    return new NextResponse("Video not found", { status: 404 });
  }

  const db = await getMongoDb();
  const bucket = new GridFSBucket(db, { bucketName: "testimonialVideos" });
  const videoId = new ObjectId(id);
  const file = await db.collection("testimonialVideos.files").findOne<{
    contentType?: string;
    length: number;
    metadata?: { contentType?: string };
  }>({ _id: videoId });

  if (!file) {
    return new NextResponse("Video not found", { status: 404 });
  }

  const range = request.headers.get("range");
  const contentType =
    file.metadata?.contentType ?? file.contentType ?? "application/octet-stream";

  if (range) {
    const parsedRange = parseRangeHeader(range, file.length);

    if (!parsedRange) {
      return new NextResponse("Requested range not satisfiable", {
        headers: {
          "Content-Range": `bytes */${file.length}`,
        },
        status: 416,
      });
    }

    const stream = bucket.openDownloadStream(videoId, {
      end: parsedRange.end + 1,
      start: parsedRange.start,
    });

    return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
      headers: {
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(parsedRange.end - parsedRange.start + 1),
        "Content-Range": `bytes ${parsedRange.start}-${parsedRange.end}/${file.length}`,
        "Content-Type": contentType,
      },
      status: 206,
    });
  }

  const stream = bucket.openDownloadStream(videoId);

  return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
    headers: {
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(file.length),
      "Content-Type": contentType,
    },
  });
}

function parseRangeHeader(range: string, fileLength: number) {
  const match = range.match(/^bytes=(\d*)-(\d*)$/);

  if (!match) {
    return null;
  }

  const [, rawStart, rawEnd] = match;
  const start = rawStart ? Number(rawStart) : 0;
  const end = rawEnd ? Number(rawEnd) : fileLength - 1;

  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    end < start ||
    start >= fileLength
  ) {
    return null;
  }

  return {
    end: Math.min(end, fileLength - 1),
    start,
  };
}
