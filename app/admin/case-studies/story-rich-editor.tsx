"use client";
import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { safeStoryUrl, type RichNode } from "@/lib/case-study-story";

export function StoryRichEditor({
  value,
  onChange,
  label,
}: {
  value: RichNode;
  onChange: (value: RichNode) => void;
  label: string;
}) {
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState("");
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [3, 4] },
        blockquote: false,
        code: false,
        codeBlock: false,
        strike: false,
        horizontalRule: false,
        hardBreak: false,
        link: { openOnClick: false, isAllowedUri: safeStoryUrl },
      }),
    ],
    immediatelyRender: false,
    content: value,
    editorProps: {
      attributes: {
        role: "textbox",
        "aria-label": label,
        class:
          "min-h-40 p-4 outline-none [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_h3]:text-xl [&_h4]:text-lg [&_a]:text-emerald-700 [&_a]:underline",
      },
    },
    onUpdate: ({ editor: active }) => onChange(active.getJSON() as RichNode),
  });
  useEffect(() => {
    if (editor && JSON.stringify(editor.getJSON()) !== JSON.stringify(value))
      editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--lumivale-line)] bg-white">
      <div
        aria-label={`${label} formatting`}
        className="flex flex-wrap gap-1 border-b border-[var(--lumivale-line)] bg-[#f7faf8] p-2"
      >
        {[
          {
            name: "Bold",
            run: () => editor?.chain().focus().toggleBold().run(),
          },
          {
            name: "Italic",
            run: () => editor?.chain().focus().toggleItalic().run(),
          },
          {
            name: "Underline",
            run: () => editor?.chain().focus().toggleUnderline().run(),
          },
          {
            name: "Subheading",
            run: () =>
              editor?.chain().focus().toggleHeading({ level: 3 }).run(),
          },
          {
            name: "Small heading",
            run: () =>
              editor?.chain().focus().toggleHeading({ level: 4 }).run(),
          },
          {
            name: "Bullets",
            run: () => editor?.chain().focus().toggleBulletList().run(),
          },
          {
            name: "Numbered list",
            run: () => editor?.chain().focus().toggleOrderedList().run(),
          },
          { name: "Undo", run: () => editor?.chain().focus().undo().run() },
          { name: "Redo", run: () => editor?.chain().focus().redo().run() },
          {
            name: "Remove link",
            run: () => editor?.chain().focus().unsetLink().run(),
          },
        ].map((button) => (
          <button
            key={button.name}
            type="button"
            className="rounded px-2 py-1.5 text-xs font-medium hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-emerald-600"
            onClick={button.run}
          >
            {button.name}
          </button>
        ))}
        <div className="flex w-full gap-2 pt-1">
          <input
            aria-label={`${label} link URL`}
            placeholder="Select text, then enter a link"
            value={link}
            onChange={(event) => setLink(event.target.value)}
            className="min-w-0 flex-1 rounded border border-[var(--lumivale-line)] bg-white px-2 py-1 text-xs"
          />
          <button
            type="button"
            className="px-2 text-xs font-semibold"
            onClick={() => {
              if (!safeStoryUrl(link)) {
                setLinkError("Use an HTTP/HTTPS URL or page path.");
                return;
              }
              editor?.chain().focus().setLink({ href: link }).run();
              setLink("");
              setLinkError("");
            }}
          >
            Add link
          </button>
        </div>
        {linkError && (
          <p role="alert" className="text-xs text-red-700">
            {linkError}
          </p>
        )}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
