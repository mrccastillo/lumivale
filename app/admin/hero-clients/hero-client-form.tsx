"use client";

import { useState, type DragEvent } from "react";

const fieldClassName =
  "min-h-12 w-full rounded-[16px] border border-[var(--lumivale-line)] bg-white px-4 py-3 text-sm text-[var(--lumivale-ink)] outline-none transition focus:border-[var(--lumivale-accent)]";

export function HeroClientForm() {
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files.item(0);
    const input = document.getElementById("hero-client-logo") as HTMLInputElement | null;

    if (!file || !input) {
      return;
    }

    const transfer = new DataTransfer();

    transfer.items.add(file);
    input.files = transfer.files;
    setFileName(file.name);
  }

  return (
    <form
      action="/api/admin/hero-clients"
      method="post"
      encType="multipart/form-data"
      className="mt-6 grid gap-4"
    >
      <Field label="Client name" name="clientName" required type="text" />

      <div>
        <label
          htmlFor="hero-client-logo"
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-[18px] border border-dashed px-5 py-6 text-center transition ${
            isDragging
              ? "border-[var(--lumivale-accent)] bg-[#eafaf2]"
              : "border-[var(--lumivale-admin-border)] bg-[#fbfcff] hover:border-[var(--lumivale-accent)]"
          }`}
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--lumivale-panel)]">
            Client logo
          </span>
          <span className="mt-3 text-sm font-semibold text-[var(--lumivale-ink)]">
            {fileName || "Drop image here or browse"}
          </span>
          <span className="mt-2 text-xs leading-5 text-[var(--lumivale-muted)]">
            PNG, JPG, WebP, or GIF. Maximum size: 5MB.
          </span>
        </label>
        <input
          id="hero-client-logo"
          name="logoFile"
          type="file"
          aria-label="Client logo"
          accept="image/png,image/jpeg,image/webp,image/gif"
          required
          className="sr-only"
          onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}
        />
      </div>

      <button
        type="submit"
        className="mt-2 inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--lumivale-panel)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--lumivale-admin-panel-soft)]"
      >
        Add hero client
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  type,
}: {
  label: string;
  name: string;
  required?: boolean;
  type: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--lumivale-admin-muted)]"
      >
        {label}
      </label>
      <input id={name} name={name} required={required} type={type} className={fieldClassName} />
    </div>
  );
}
