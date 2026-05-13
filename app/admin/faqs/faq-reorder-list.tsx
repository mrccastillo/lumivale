"use client";

import { useState, type DragEvent } from "react";
import Link from "next/link";

import type { FaqStatus } from "@/lib/faqs";

export type FaqReorderItem = {
  answer: string;
  id: string;
  question: string;
  status: FaqStatus;
};

type FaqReorderListProps = {
  allFaqIds: string[];
  canReorder: boolean;
  faqs: FaqReorderItem[];
  returnTo: string;
};

export function FaqReorderList({
  allFaqIds,
  canReorder,
  faqs,
  returnTo,
}: FaqReorderListProps) {
  const [items, setItems] = useState(faqs);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const orderValue = JSON.stringify(buildOrder(items));

  function buildOrder(nextItems: FaqReorderItem[]) {
    const nextOrder = [...allFaqIds];
    const targetIndexes = faqs
      .map((faq) => allFaqIds.indexOf(faq.id))
      .filter((index) => index >= 0);

    nextItems.forEach((faq, index) => {
      const targetIndex = targetIndexes[index];

      if (targetIndex !== undefined) {
        nextOrder[targetIndex] = faq.id;
      }
    });

    return nextOrder;
  }

  async function saveOrder(nextItems: FaqReorderItem[]) {
    if (!canReorder) {
      return;
    }

    const formData = new FormData();

    formData.set("order", JSON.stringify(buildOrder(nextItems)));
    formData.set("redirectTo", returnTo);
    setSaveState("saving");

    try {
      const response = await fetch("/api/admin/faqs/reorder", {
        method: "POST",
        body: formData,
        headers: {
          "X-FAQ-Reorder": "autosave",
        },
      });

      if (!response.ok) {
        throw new Error("Unable to save FAQ order.");
      }

      setIsDirty(false);
      setSaveState("saved");
    } catch {
      setIsDirty(true);
      setSaveState("error");
    }
  }

  function moveFaq(sourceId: string, targetId: string) {
    if (sourceId === targetId) {
      return;
    }

    const sourceIndex = items.findIndex((faq) => faq.id === sourceId);
    const targetIndex = items.findIndex((faq) => faq.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1) {
      return;
    }

    const nextItems = [...items];
    const [movedFaq] = nextItems.splice(sourceIndex, 1);

    nextItems.splice(targetIndex, 0, movedFaq);
    setItems(nextItems);
    setIsDirty(true);
    void saveOrder(nextItems);
  }

  function moveByStep(id: string, step: -1 | 1) {
    const index = items.findIndex((faq) => faq.id === id);
    const nextIndex = index + step;

    if (index === -1 || nextIndex < 0 || nextIndex >= items.length) {
      return;
    }

    const nextItems = [...items];
    const [movedFaq] = nextItems.splice(index, 1);

    nextItems.splice(nextIndex, 0, movedFaq);
    setItems(nextItems);
    setIsDirty(true);
    void saveOrder(nextItems);
  }

  function getSaveMessage() {
    if (!canReorder) {
      return "Clear filters to save a new order.";
    }

    if (saveState === "saving") {
      return "Saving order...";
    }

    if (saveState === "saved") {
      return "Order saved.";
    }

    if (saveState === "error") {
      return "Order could not be saved. Use Save order to retry.";
    }

    return "Drag a card or use Up/Down to save the order automatically.";
  }

  function handleDrop(event: DragEvent<HTMLElement>, targetId: string) {
    event.preventDefault();

    if (draggedId) {
      moveFaq(draggedId, targetId);
    }

    setDraggedId(null);
  }

  if (!items.length) {
    return null;
  }

  return (
    <div className="mt-6">
      <form
        action="/api/admin/faqs/reorder"
        method="post"
        className="mb-4 flex flex-col gap-3 rounded-lg border border-[var(--lumivale-admin-border)] bg-[var(--lumivale-admin-surface)] p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p className="text-sm font-semibold text-[var(--lumivale-ink)]">
            Drag to reorder FAQs
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--lumivale-admin-muted)]">
            The first five published FAQs are shown on the homepage.
          </p>
          <p className="mt-2 text-xs font-semibold text-[var(--lumivale-panel)]">
            {getSaveMessage()}
          </p>
        </div>
        <input type="hidden" name="order" value={orderValue} />
        <input type="hidden" name="redirectTo" value={returnTo} />
        <button
          type="submit"
          disabled={!canReorder || (!isDirty && saveState !== "error")}
          className="min-h-11 rounded-lg bg-[var(--lumivale-panel)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--lumivale-admin-panel-soft)] disabled:cursor-not-allowed disabled:bg-[#9fb4aa]"
        >
          {saveState === "error" ? "Retry save" : "Save order"}
        </button>
      </form>

      <div className="grid gap-5 lg:grid-cols-2">
        {items.map((faq, index) => (
          <FaqCard
            key={faq.id}
            canReorder={canReorder}
            faq={faq}
            index={index}
            isDragging={draggedId === faq.id}
            isFirst={index === 0}
            isLast={index === items.length - 1}
            onDragEnd={() => setDraggedId(null)}
            onDragOver={(event) => {
              if (canReorder) {
                event.preventDefault();
              }
            }}
            onDragStart={() => setDraggedId(faq.id)}
            onDrop={(event) => handleDrop(event, faq.id)}
            onMoveDown={() => moveByStep(faq.id, 1)}
            onMoveUp={() => moveByStep(faq.id, -1)}
          />
        ))}
      </div>
    </div>
  );
}

function FaqCard({
  canReorder,
  faq,
  index,
  isDragging,
  isFirst,
  isLast,
  onDragEnd,
  onDragOver,
  onDragStart,
  onDrop,
  onMoveDown,
  onMoveUp,
}: {
  canReorder: boolean;
  faq: FaqReorderItem;
  index: number;
  isDragging: boolean;
  isFirst: boolean;
  isLast: boolean;
  onDragEnd: () => void;
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDragStart: () => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
}) {
  return (
    <article
      draggable={canReorder}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragStart={canReorder ? onDragStart : undefined}
      onDrop={canReorder ? onDrop : undefined}
      className={`overflow-hidden rounded-lg border bg-white transition ${
        isDragging
          ? "border-[var(--lumivale-panel)] opacity-60"
          : "border-[var(--lumivale-admin-border)]"
      }`}
    >
      <div className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[var(--lumivale-admin-chip)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--lumivale-panel)]">
              {faq.status}
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lumivale-admin-muted)]">
              Position {index + 1}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={`Move ${faq.question} up`}
              disabled={!canReorder || isFirst}
              onClick={onMoveUp}
              className="grid h-9 min-w-14 place-items-center rounded-lg border border-[var(--lumivale-admin-border)] px-2 text-xs font-semibold text-[var(--lumivale-panel)] disabled:cursor-not-allowed disabled:text-[#9fb4aa]"
            >
              Up
            </button>
            <button
              type="button"
              aria-label={`Move ${faq.question} down`}
              disabled={!canReorder || isLast}
              onClick={onMoveDown}
              className="grid h-9 min-w-14 place-items-center rounded-lg border border-[var(--lumivale-admin-border)] px-2 text-xs font-semibold text-[var(--lumivale-panel)] disabled:cursor-not-allowed disabled:text-[#9fb4aa]"
            >
              Down
            </button>
            <span
              aria-label={`Drag ${faq.question}`}
              className="grid h-9 min-w-14 cursor-grab place-items-center rounded-lg border border-[var(--lumivale-admin-border)] px-2 text-xs font-semibold text-[var(--lumivale-panel)]"
            >
              Drag
            </span>
          </div>
        </div>

        <h2 className="mt-4 text-xl font-semibold text-[var(--lumivale-ink)]">{faq.question}</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--lumivale-admin-muted)]">
          {faq.answer}
        </p>

        <div className="mt-5 rounded-lg border border-[var(--lumivale-admin-border)] bg-[var(--lumivale-admin-surface)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--lumivale-admin-muted)]">
            Publishing notes
          </p>
          <p className="mt-2 text-sm text-[var(--lumivale-ink)]">
            {faq.status === "published"
              ? "Visible on the public FAQ section when it is within the first five published FAQs."
              : "Draft answer. Publish when the copy is ready for visitors."}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={`/admin/faqs/${faq.id}/edit`}
            className="rounded-lg border border-[var(--lumivale-admin-border)] px-4 py-2 text-sm font-semibold text-[var(--lumivale-panel)]"
          >
            Edit
          </Link>
          <form action={`/api/admin/faqs/${faq.id}`} method="post">
            <input
              type="hidden"
              name="action"
              value={faq.status === "published" ? "draft" : "publish"}
            />
            <button
              type="submit"
              className="rounded-lg border border-[var(--lumivale-admin-border)] px-4 py-2 text-sm font-semibold text-[var(--lumivale-panel)]"
            >
              {faq.status === "published" ? "Unpublish" : "Publish"}
            </button>
          </form>
          <form action={`/api/admin/faqs/${faq.id}`} method="post">
            <input type="hidden" name="action" value="delete" />
            <button
              type="submit"
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600"
            >
              Delete
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}
