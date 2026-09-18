"use client";

import { useState } from "react";

export function SendMagicLinkButton({ email }: { email: string }) {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");

  async function sendLink() {
    setSending(true);
    setMessage("");
    setError("");
    setPreview("");
    try {
      const body = new FormData();
      body.set("email", email);
      const response = await fetch("/api/admin/trusted-clients/send-link", { method: "POST", body });
      if (response.redirected) throw new Error("Your session has expired. Sign in again to send a link.");
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not send the magic link. Please try again.");
      if (result.mode === "preview") {
        setMessage("Email is not configured. Use the development preview below.");
        setPreview(result.previewUrl);
      } else {
        setMessage("Magic link sent.");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not send the magic link. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-xs">
      <button type="button" onClick={sendLink} disabled={sending} aria-label={`Send magic link to ${email}`}
        className="rounded-lg bg-[var(--lumivale-panel)] px-4 py-2 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60">
        {sending ? "Sending…" : "Send magic link"}
      </button>
      {message ? <p role="status" className="mt-2 text-xs text-emerald-800">{message}</p> : null}
      {error ? <p role="alert" className="mt-2 text-xs text-red-700">{error}</p> : null}
      {preview ? <a href={preview} target="_blank" rel="noopener noreferrer" className="mt-2 block text-xs underline">Open preview magic link</a> : null}
    </div>
  );
}
