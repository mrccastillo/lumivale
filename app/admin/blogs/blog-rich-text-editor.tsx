"use client";

import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { type ChangeEvent, type ReactNode, type RefObject, useEffect, useRef, useState } from "react";
import {
  MdCode,
  MdFormatBold,
  MdFormatItalic,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdFormatQuote,
  MdFormatUnderlined,
  MdImage,
  MdLink,
  MdLinkOff,
  MdRedo,
  MdStrikethroughS,
  MdUndo,
} from "react-icons/md";

const IMAGE_TYPES = "image/png,image/jpeg,image/webp,image/gif";

type BlogRichTextEditorProps = {
  htmlValue?: string;
  name?: string;
  onChange?: (payload: { html: string; markdown: string }) => void;
  required?: boolean;
  value?: string;
};

type MenuBarProps = {
  fileInputRef: RefObject<HTMLInputElement | null>;
  htmlMode: boolean;
  isUploadingImage: boolean;
  onToggleHtmlMode: () => void;
  editor: Editor | null;
};

export function BlogRichTextEditor({
  htmlValue = "",
  name = "body",
  onChange,
  required,
  value = "",
}: BlogRichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [htmlMode, setHtmlMode] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false,
        underline: false,
      }),
      Underline,
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg border border-[var(--lumivale-line)]",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[var(--lumivale-accent)] underline underline-offset-4",
        },
      }),
    ],
    content: htmlValue || "<p></p>",
    editorProps: {
      attributes: {
        "aria-label": "Visual blog editor",
        class:
          "lumivale-tiptap-editor min-h-[320px] bg-white p-4 text-base text-[var(--lumivale-ink)] outline-none",
        role: "textbox",
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor: activeEditor }) => {
      const html = normalizeEditorHtml(activeEditor.getHTML());
      onChange?.({ html, markdown: htmlToMarkdown(html) });
    },
  });

  useEffect(() => {
    if (!editor || htmlMode) {
      return;
    }

    const nextHtml = htmlValue || "<p></p>";

    if (nextHtml !== editor.getHTML()) {
      editor.commands.setContent(nextHtml, { emitUpdate: false });
    }
  }, [editor, htmlMode, htmlValue]);

  function handleHtmlChange(nextHtml: string) {
    const normalizedHtml = normalizeEditorHtml(nextHtml);

    onChange?.({ html: normalizedHtml, markdown: htmlToMarkdown(normalizedHtml) });
    editor?.commands.setContent(nextHtml || "<p></p>", { emitUpdate: false });
  }

  async function handleImageInsert(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file || !editor) {
      return;
    }

    setUploadError("");
    setIsUploadingImage(true);

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

      const data = (await response.json()) as { imageUrl?: string };

      if (!data.imageUrl) {
        throw new Error("Upload failed.");
      }

      const alt =
        window.prompt("Image alt text", file.name.replace(/\.[^.]+$/, ""))?.trim() ||
        "Blog image";

      editor
        .chain()
        .focus()
        .setImage({ alt, src: data.imageUrl })
        .run();
    } catch {
      setUploadError("Image upload failed. Try another JPG, PNG, WebP, or GIF.");
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  }

  return (
    <div className="overflow-hidden rounded-[22px] border border-[var(--lumivale-line)] bg-white">
      <MenuBar
        editor={editor}
        fileInputRef={fileInputRef}
        htmlMode={htmlMode}
        isUploadingImage={isUploadingImage}
        onToggleHtmlMode={() => setHtmlMode((current) => !current)}
      />

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
        <EditorContent editor={editor} />
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

function MenuBar({
  editor,
  fileInputRef,
  htmlMode,
  isUploadingImage,
  onToggleHtmlMode,
}: MenuBarProps) {
  if (!editor) {
    return (
      <div className="flex min-h-12 items-center border-b border-[var(--lumivale-line)] bg-[#f8fafc] px-3 text-sm text-[var(--lumivale-muted)]">
        Loading editor
      </div>
    );
  }

  function setLink() {
    const previousUrl = editor?.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", previousUrl || "https://");

    if (url === null) {
      return;
    }

    if (!url) {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div className="flex flex-wrap gap-1 border-b border-[var(--lumivale-line)] bg-[#f8fafc] p-2">
      {!htmlMode ? (
        <>
          <ToolbarButton
            active={editor.isActive("bold")}
            label="Bold"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <MdFormatBold size={18} />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("italic")}
            label="Italic"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <MdFormatItalic size={18} />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("underline")}
            label="Underline"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <MdFormatUnderlined size={18} />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("strike")}
            label="Strikethrough"
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <MdStrikethroughS size={18} />
          </ToolbarButton>
          <Divider />
          <ToolbarButton
            active={editor.isActive("paragraph")}
            label="Paragraph"
            onClick={() => editor.chain().focus().setParagraph().run()}
          >
            p
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("heading", { level: 1 })}
            label="Heading 1"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            h1
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("heading", { level: 2 })}
            label="Heading 2"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            h2
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("heading", { level: 3 })}
            label="Heading 3"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            h3
          </ToolbarButton>
          <Divider />
          <ToolbarButton
            active={editor.isActive("bulletList")}
            label="Bulleted list"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <MdFormatListBulleted size={18} />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("orderedList")}
            label="Numbered list"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <MdFormatListNumbered size={18} />
          </ToolbarButton>
          <Divider />
          <ToolbarButton active={editor.isActive("link")} label="Link" onClick={setLink}>
            <MdLink size={18} />
          </ToolbarButton>
          <ToolbarButton
            label="Unset link"
            onClick={() => editor.chain().focus().unsetLink().run()}
          >
            <MdLinkOff size={18} />
          </ToolbarButton>
          <ToolbarButton
            label="Image"
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploadingImage ? "..." : <MdImage size={18} />}
          </ToolbarButton>
          <Divider />
          <ToolbarButton
            active={editor.isActive("blockquote")}
            label="Quote"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <MdFormatQuote size={18} />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("codeBlock")}
            label="Code block"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            <MdCode size={18} />
          </ToolbarButton>
          <Divider />
          <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()}>
            <MdUndo size={18} />
          </ToolbarButton>
          <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()}>
            <MdRedo size={18} />
          </ToolbarButton>
        </>
      ) : null}

      <button
        type="button"
        aria-label="HTML"
        onClick={onToggleHtmlMode}
        className={`ml-auto rounded-lg px-2.5 py-1.5 text-[11px] font-bold tracking-[0.12em] transition ${
          htmlMode
            ? "bg-[var(--lumivale-accent)] text-[var(--lumivale-deep)]"
            : "text-[var(--lumivale-muted)] hover:bg-[#eef4f8]"
        }`}
      >
        HTML
      </button>
    </div>
  );
}

function ToolbarButton({
  active = false,
  children,
  label,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex min-h-8 min-w-8 items-center justify-center rounded-md px-1.5 text-[11px] font-bold transition ${
        active
          ? "bg-[var(--lumivale-accent)] text-[var(--lumivale-deep)]"
          : "text-[var(--lumivale-muted)] hover:bg-[#eef4f8] hover:text-[var(--lumivale-ink)]"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return (
    <span
      aria-hidden="true"
      className="mx-1 h-6 w-px self-center bg-[var(--lumivale-line)]"
    />
  );
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
  const container = document.createElement("div");
  container.innerHTML = html;

  if (!container.textContent?.trim() && !container.querySelector("img")) {
    return "";
  }

  return container.innerHTML.trim();
}
