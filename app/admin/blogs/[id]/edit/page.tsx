import { notFound } from "next/navigation";

import { BlogForm } from "@/app/admin/blogs/blog-form";
import { requireAdminAccess } from "@/lib/admin-auth";
import { getBlogPostById } from "@/lib/blogs";
import { getMongoDb } from "@/lib/mongodb";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminAccess();
  const { id } = await params;
  const db = await getMongoDb();
  const post = await getBlogPostById(db, id);

  if (!post) {
    notFound();
  }

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-[var(--lumivale-accent)]">
            Admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[var(--lumivale-ink)]">
            Edit Blog Post
          </h1>
        </div>
      </div>
      <BlogForm post={post} />
    </section>
  );
}
