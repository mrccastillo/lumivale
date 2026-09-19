import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminAccess } from "@/lib/admin-auth";
import { getMongoDb } from "@/lib/mongodb";
import { checkStoryOrigin, refreshCaseStudies, storyApiError } from "@/lib/case-study-api";
import { reorderCaseStudies } from "@/lib/case-study-order";

export async function POST(request: Request) {
  await requireAdminAccess();
  const rejected = checkStoryOrigin(request);
  if (rejected) return rejected;
  try {
    const { order } = await request.json();
    await reorderCaseStudies(await getMongoDb(), order);
    refreshCaseStudies();
    revalidatePath("/admin/case-studies");
    return NextResponse.json({ ok: true });
  } catch (error) { return storyApiError(error); }
}
