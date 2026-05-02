import { notFound } from "next/navigation";

import { hasTrustedClientAccess } from "@/lib/trusted-client";

export default async function PricingPage() {
  const hasTrustedAccess = await hasTrustedClientAccess();

  if (!hasTrustedAccess) {
    notFound();
  }

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-[54px]">
      <h1 className="text-3xl font-medium text-stone-900">Pricing</h1>
      <p className="max-w-2xl text-stone-600">
        Private flat-rate growth packages for approved Lumivale clients.
      </p>
    </section>
  );
}
