"use client";

import { type ChangeEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";

const IMAGE_TYPES = "image/png,image/jpeg,image/webp,image/gif";

type BlogRichTextEditorProps = {
  htmlValue?: string;
  name?: string;
  onChange?: (payload: { html: string; markdown: string }) => void;
  required?: boolean;
  value?: string;
};

type IconName =
  | "bold"
  | "code"
  | "image"
  | "italic"
  | "link"
  | "linkOff"
  | "list"
  | "orderedList"
  | "quote"
  | "redo"
  | "strikethrough"
  | "underline"
  | "undo";

const toolbarButtons: Array<{
  command?: string;
  icon?: IconName;
  label: string;
  text?: string;
  type?: "divider";
  value?: string;
}> = [
  { command: "bold", icon: "bold", label: "Bold" },
  { command: "italic", icon: "italic", label: "Italic" },
  { command: "underline", icon: "underline", label: "Underline" },
  { command: "strikeThrough", icon: "strikethrough", label: "Strikethrough" },
  { type: "divider", label: "divider-1" },
  { command: "formatBlock", label: "Heading 1", text: "<h1>", value: "h1" },
  { command: "formatBlock", label: "Heading 2", text: "<h2>", value: "h2" },
  { command: "formatBlock", label: "Heading 3", text: "<h3>", value: "h3" },
  { type: "divider", label: "divider-2" },
  { command: "insertUnorderedList", icon: "list", label: "Bulleted list" },
  { command: "insertOrderedList", icon: "orderedList", label: "Numbered list" },
  { type: "divider", label: "divider-3" },
  { command: "createLink", icon: "link", label: "Link" },
  { command: "unlink", icon: "linkOff", label: "Unset link" },
  { command: "insertImage", icon: "image", label: "Image" },
  { type: "divider", label: "divider-4" },
  { command: "formatBlock", icon: "quote", label: "Quote", value: "blockquote" },
  { command: "formatBlock", icon: "code", label: "Code block", value: "pre" },
  { type: "divider", label: "divider-5" },
  { command: "undo", icon: "undo", label: "Undo" },
  { command: "redo", icon: "redo", label: "Redo" },
];

export function BlogRichTextEditor({
  htmlValue = "",
  name = "body",
  onChange,
  required,
  value = "",
}: BlogRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isApplyingRef = useRef(false);
  const [htmlMode, setHtmlMode] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== htmlValue && !htmlMode) {
      editorRef.current.innerHTML = htmlValue;
    }
  }, [htmlMode, htmlValue]);

  function syncFromHtml(nextHtml: string) {
    const normalizedHtml = normalizeEditorHtml(nextHtml);
    const nextMarkdown = htmlToMarkdown(normalizedHtml);

    onChange?.({ html: normalizedHtml, markdown: nextMarkdown });
  }

  function syncFromVisual() {
    if (!editorRef.current) {
      return;
    }

    syncFromHtml(editorRef.current.innerHTML);
  }

  function applyCommand(command: string, valueOverride?: string) {
    if (!editorRef.current) {
      return;
    }

    editorRef.current.focus();

    if (command === "createLink") {
      const url = window.prompt("URL", "https://");

      if (url === null) {
        return;
      }

      if (!url) {
        document.execCommand("unlink");
      } else {
        document.execCommand("createLink", false, url);
      }

      syncFromVisual();
      return;
    }

    if (command === "insertImage") {
      fileInputRef.current?.click();
      return;
    }

    document.execCommand(command, false, valueOverride);
    syncFromVisual();
  }

  async function handleImageInsert(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/uploads", {
        body: formData,
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Upload failed.");
      }

      const data = (await response.json()) as { imageId?: string };

      if (!data.imageId) {
        throw new Error("Upload failed.");
      }

      const altText =
        window.prompt("Image alt text", file.name.replace(/\.[^.]+$/, ""))?.trim() ||
        "Blog image";
      const imageHtml = `<figure><img src="/api/blog-images/${data.imageId}" alt="${escapeHtml(
        altText,
      )}" /></figure>`;

      if (!insertHtmlAtSelection(imageHtml)) {
        editorRef.current?.insertAdjacentHTML("beforeend", imageHtml);
      }

      syncFromVisual();
    } catch {
      setUploadError("Image upload failed. Try another JPG, PNG, WebP, or GIF.");
    } finally {
      event.target.value = "";
    }
  }

  function handleVisualInput() {
    if (isApplyingRef.current) {
      return;
    }

    syncFromVisual();
  }

  function handleHtmlChange(nextHtml: string) {
    isApplyingRef.current = true;
    syncFromHtml(nextHtml);
    if (editorRef.current) {
      editorRef.current.innerHTML = normalizeEditorHtml(nextHtml);
    }
    isApplyingRef.current = false;
  }

  function handleEditorKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b") {
      event.preventDefault();
      applyCommand("bold");
    }
  }

  return (
    <div className="overflow-hidden rounded-[22px] border border-[var(--lumivale-line)] bg-white">
      <div className="flex flex-wrap gap-1 border-b border-[var(--lumivale-line)] bg-[#f8fafc] p-2">
        {toolbarButtons.map((button) => {
          if (button.type === "divider") {
            return (
              <span
                key={button.label}
                className="mx-1 h-6 w-px self-center bg-[var(--lumivale-line)]"
                aria-hidden="true"
              />
            );
          }

          return (
            <ToolbarButton
              key={button.label}
              label={button.label}
              onClick={() => applyCommand(button.command!, button.value)}
              text={button.text}
              icon={button.icon}
            />
          );
        })}
        <button
          type="button"
          aria-label="HTML"
          onClick={() => setHtmlMode((current) => !current)}
          className={`ml-auto rounded-lg px-2.5 py-1.5 text-[11px] font-bold tracking-[0.12em] transition ${
            htmlMode
              ? "bg-[var(--lumivale-accent)] text-[var(--lumivale-deep)]"
              : "text-[var(--lumivale-muted)] hover:bg-[#eef4f8]"
          }`}
        >
          HTML
        </button>
      </div>

      <input
        ref={fileInputRef}
        aria-label="Insert image between sections"
        type="file"
        accept={IMAGE_TYPES}
        className="sr-only"
        onChange={handleImageInsert}
      />

      {htmlMode ? (
        <textarea
          aria-label="HTML editor"
          value={htmlValue}
          onChange={(event) => handleHtmlChange(event.target.value)}
          spellCheck={false}
          className="min-h-[320px] w-full resize-y border-0 bg-white p-4 font-mono text-sm text-[var(--lumivale-ink)] outline-none"
        />
      ) : (
        <div
          ref={editorRef}
          role="textbox"
          aria-label="Visual blog editor"
          aria-multiline="true"
          contentEditable
          spellCheck={false}
          suppressContentEditableWarning
          onInput={handleVisualInput}
          onBlur={syncFromVisual}
          onKeyDown={handleEditorKeyDown}
          className="lumivale-visual-editor min-h-[320px] bg-white p-4 text-base text-[var(--lumivale-ink)] outline-none"
        />
      )}

      <textarea
        aria-hidden="true"
        tabIndex={-1}
        name={name}
        required={required}
        value={value}
        readOnly
        className="sr-only"
      />

      {uploadError ? (
        <p className="border-t border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {uploadError}
        </p>
      ) : null}
    </div>
  );
}

function ToolbarButton({
  icon,
  label,
  onClick,
  text,
}: {
  icon?: IconName;
  label: string;
  onClick: () => void;
  text?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex min-h-8 min-w-8 items-center justify-center rounded-md px-1.5 text-[var(--lumivale-muted)] transition hover:bg-[#eef4f8] hover:text-[var(--lumivale-ink)]"
    >
      {text ? <span className="text-[11px] font-bold">{text}</span> : <ToolbarIcon name={icon!} />}
    </button>
  );
}

function ToolbarIcon({ name }: { name: IconName }) {
  const common = {
    "aria-hidden": true,
    className: "h-4 w-4",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 2,
    viewBox: "0 0 24 24",
  };

  switch (name) {
    case "bold":
      return (
        <svg {...common}>
          <path d="M7 5h7a4 4 0 0 1 0 8H7z" />
          <path d="M7 13h8a4 4 0 0 1 0 8H7z" />
        </svg>
      );
    case "italic":
      return (
        <svg {...common}>
          <path d="M10 5h8" />
          <path d="M6 19h8" />
          <path d="M14 5 10 19" />
        </svg>
      );
    case "underline":
      return (
        <svg {...common}>
          <path d="M7 5v6a5 5 0 0 0 10 0V5" />
          <path d="M5 21h14" />
        </svg>
      );
    case "strikethrough":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="M16 6.5A4.5 4.5 0 0 0 12 5c-2.5 0-4 1.2-4 3" />
          <path d="M8 17.5A5.5 5.5 0 0 0 12 19c2.5 0 4-1.2 4-3" />
        </svg>
      );
    case "list":
      return (
        <svg {...common}>
          <path d="M8 6h12" />
          <path d="M8 12h12" />
          <path d="M8 18h12" />
          <path d="M4 6h.01" />
          <path d="M4 12h.01" />
          <path d="M4 18h.01" />
        </svg>
      );
    case "orderedList":
      return (
        <svg {...common}>
          <path d="M10 6h10" />
          <path d="M10 12h10" />
          <path d="M10 18h10" />
          <path d="M4 6h1v4" />
          <path d="M4 14h2l-2 3h2" />
        </svg>
      );
    case "link":
      return (
        <svg {...common}>
          <path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" />
          <path d="M14 11a5 5 0 0 0-7.1 0l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1" />
        </svg>
      );
    case "linkOff":
      return (
        <svg {...common}>
          <path d="M9 15 5 19a5 5 0 0 0 7 7l4-4" />
          <path d="m15 9 4-4a5 5 0 1 0-7-7L8 2" />
          <path d="M3 21 21 3" />
        </svg>
      );
    case "image":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="8" cy="10" r="1.5" />
          <path d="m21 15-5-5-4 4-2-2-5 5" />
        </svg>
      );
    case "quote":
      return (
        <svg {...common}>
          <path d="M10 8H6v4h4v4H6" />
          <path d="M18 8h-4v4h4v4h-4" />
        </svg>
      );
    case "code":
      return (
        <svg {...common}>
          <path d="m9 18-6-6 6-6" />
          <path d="m15 6 6 6-6 6" />
        </svg>
      );
    case "undo":
      return (
        <svg {...common}>
          <path d="M9 14 4 9l5-5" />
          <path d="M20 20a8 8 0 0 0-8-8H4" />
        </svg>
      );
    case "redo":
      return (
        <svg {...common}>
          <path d="m15 14 5-5-5-5" />
          <path d="M4 20a8 8 0 0 1 8-8h8" />
        </svg>
      );
  }
}

function htmlToMarkdown(html: string) {
  const container = document.createElement("div");
  container.innerHTML = normalizeEditorHtml(html);

  return Array.from(container.childNodes)
    .map(nodeToMarkdown)
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

function nodeToMarkdown(node: ChildNode): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent?.trim() ?? "";
  }

  if (!(node instanceof HTMLElement)) {
    return "";
  }

  const text = inlineMarkdown(node).trim();

  switch (node.tagName.toLowerCase()) {
    case "h1":
      return `# ${text}`;
    case "h2":
      return `## ${text}`;
    case "h3":
      return `### ${text}`;
    case "blockquote":
      return text
        .split(/\r?\n/)
        .map((line) => `> ${line}`)
        .join("\n");
    case "ul":
      return Array.from(node.children)
        .map((child) => `- ${inlineMarkdown(child).trim()}`)
        .join("\n");
    case "ol":
      return Array.from(node.children)
        .map((child, index) => `${index + 1}. ${inlineMarkdown(child).trim()}`)
        .join("\n");
    case "figure": {
      const image = node.querySelector("img");
      return image ? `![${image.alt}](${image.getAttribute("src") ?? ""})` : "";
    }
    case "img":
      return `![${node.getAttribute("alt") ?? ""}](${node.getAttribute("src") ?? ""})`;
    case "pre":
      return `\`\`\`\n${node.textContent?.trim() ?? ""}\n\`\`\``;
    case "div":
    case "p":
      return text;
    default:
      return text;
  }
}

function inlineMarkdown(node: ChildNode): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? "";
  }

  if (!(node instanceof HTMLElement)) {
    return "";
  }

  const content = Array.from(node.childNodes).map(inlineMarkdown).join("");

  switch (node.tagName.toLowerCase()) {
    case "strong":
    case "b":
      return `**${content}**`;
    case "em":
    case "i":
      return `_${content}_`;
    case "u":
      return `<u>${content}</u>`;
    case "s":
    case "strike":
      return `~~${content}~~`;
    case "a":
      return `[${content}](${node.getAttribute("href") ?? ""})`;
    case "br":
      return "\n";
    default:
      return content;
  }
}

function normalizeEditorHtml(html: string) {
  return html
    .replace(/<div><br><\/div>/g, "")
    .replace(/<p><br><\/p>/g, "")
    .trim();
}

function insertHtmlAtSelection(html: string) {
  const selection = window.getSelection();

  if (!selection?.rangeCount) {
    return false;
  }

  const range = selection.getRangeAt(0);
  const template = document.createElement("template");
  template.innerHTML = html;
  range.deleteContents();
  range.insertNode(template.content.cloneNode(true));
  selection.removeAllRanges();

  return true;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
