"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import type { StoryImage } from "@/lib/case-study-story";

export function StoryImagePicker({
  label,
  value,
  onChange,
  onPending,
}: {
  label: string;
  value?: StoryImage;
  onChange: (image: StoryImage | undefined) => void;
  onPending: (delta: number) => void;
}) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const generation = useRef(0);
  const callbacks = useRef({ onChange, onPending, value });
  const active = useRef<{
    controller: AbortController;
    finish: () => void;
  } | null>(null);
  useEffect(() => {
    callbacks.current = { onChange, onPending, value };
  }, [onChange, onPending, value]);
  useEffect(
    () => () => {
      generation.current++;
      active.current?.controller.abort();
      active.current?.finish();
    },
    [],
  );
  async function upload(file?: File) {
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 5 * 1024 * 1024 ||
      !file.size
    ) {
      setError("Choose a JPG, PNG, or WEBP image up to 5 MiB.");
      return;
    }
    const token = ++generation.current;
    active.current?.controller.abort();
    active.current?.finish();
    const controller = new AbortController();
    let settled = false;
    const finish = () => {
      if (!settled) {
        settled = true;
        callbacks.current.onPending(-1);
      }
    };
    active.current = { controller, finish };
    setPending(true);
    setError("");
    callbacks.current.onPending(1);
    try {
      const data = new FormData();
      data.set("image", file);
      const response = await fetch("/api/admin/case-studies/upload-image", {
        method: "POST",
        body: data,
        signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Image upload failed.");
      if (token !== generation.current) return;
      // Read natural dimensions locally so the public page can reserve the correct space.
      const dimensions = await new Promise<{ width?: number; height?: number }>(
        (resolve) => {
          const objectUrl = URL.createObjectURL(file);
          const img = new Image();
          img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve({ width: img.naturalWidth, height: img.naturalHeight });
          };
          img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            resolve({});
          };
          img.src = objectUrl;
        },
      );
      if (token === generation.current)
        callbacks.current.onChange({
          ...callbacks.current.value,
          url: result.url,
          alt: callbacks.current.value?.alt ?? "",
          ...dimensions,
        });
    } catch (cause) {
      if (token === generation.current)
        setError(
          cause instanceof Error ? cause.message : "Image upload failed.",
        );
    } finally {
      finish();
      if (token === generation.current) {
        setPending(false);
        active.current = null;
      }
    }
  }
  return (
    <div className="space-y-3 rounded-xl border border-[var(--lumivale-line)] bg-[#f7faf8] p-4">
      <label className="block text-sm font-semibold">
        {label}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="mt-2 block w-full text-xs"
          onChange={(event) => {
            void upload(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </label>
      {pending && (
        <p role="status" className="text-sm text-emerald-800">
          Uploading image…
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      {value && (
        <>
          <img
            src={value.url}
            alt={value.alt || "Image preview"}
            className="max-h-52 max-w-full rounded object-contain"
          />
          <label className="block text-xs font-semibold">
            Alternative text
            <input
              value={value.alt}
              maxLength={500}
              onChange={(event) =>
                onChange({ ...value, alt: event.target.value })
              }
              className="mt-1 block w-full rounded border border-[var(--lumivale-line)] bg-white p-2 text-sm font-normal"
            />
          </label>
          <label className="block text-xs font-semibold">
            Caption (optional)
            <input
              value={value.caption ?? ""}
              maxLength={1000}
              onChange={(event) =>
                onChange({ ...value, caption: event.target.value })
              }
              className="mt-1 block w-full rounded border border-[var(--lumivale-line)] bg-white p-2 text-sm font-normal"
            />
          </label>
        </>
      )}
      {(value || pending || error) && (
        <button
          type="button"
          className="text-xs font-semibold text-red-700"
          onClick={() => {
            generation.current++;
            active.current?.controller.abort();
            active.current?.finish();
            active.current = null;
            setPending(false);
            setError("");
            onChange(undefined);
          }}
        >
          Remove image
        </button>
      )}
      <p className="text-xs leading-5 text-[var(--lumivale-muted)]">
        JPG, PNG, WEBP · up to 5 MiB. Crop or redact private information before
        uploading. Add alternative text before publishing.
      </p>
    </div>
  );
}
