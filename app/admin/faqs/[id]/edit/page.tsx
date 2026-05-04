import { notFound } from "next/navigation";

import { FaqForm } from "@/app/admin/faqs/faq-form";
import { requireAdminAccess } from "@/lib/admin-auth";
import { getFaqById } from "@/lib/faqs";
import { getMongoDb } from "@/lib/mongodb";

export default async function EditFaqPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminAccess();
  const { id } = await params;
  const db = await getMongoDb();
  const faq = await getFaqById(db, id);

  if (!faq) {
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
            Edit FAQ
          </h1>
        </div>
      </div>
      <FaqForm faq={faq} />
    </section>
  );
}
