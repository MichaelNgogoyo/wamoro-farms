"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import type { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";

function ToolbarButton({ editor, label, onClick, active = false }: { editor: Editor | null; label: string; onClick: () => void; active?: boolean }) {
  return <button type="button" title={label} aria-label={label} disabled={!editor} className={active ? "is-active" : ""} onClick={onClick}>{label}</button>;
}

export function RichTextEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ allowBase64: false }),
      Youtube.configure({ controls: true, nocookie: true, modestBranding: true }),
    ],
    content: value,
    editorProps: { attributes: { class: "editor-content", "aria-label": "Article body" } },
    onUpdate: ({ editor: updated }) => onChange(updated.getHTML()),
  });
  useEffect(() => {
    if (editor && editor.getHTML() !== value && value === "") editor.commands.clearContent();
  }, [editor, value]);
  const askForLink = () => {
    if (!editor) return;
    const href = window.prompt("Paste a secure https:// link");
    if (href && href.startsWith("https://")) editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  };
  const askForImage = () => {
    if (!editor) return;
    const src = window.prompt("Paste the URL of an uploaded image");
    if (src && (src.startsWith("/api/media/") || src.startsWith("https://"))) editor.chain().focus().setImage({ src, alt: "" }).run();
  };
  const askForVideo = () => {
    if (!editor) return;
    const src = window.prompt("Paste a YouTube URL");
    if (src && (src.includes("youtube.com/") || src.includes("youtu.be/"))) editor.commands.setYoutubeVideo({ src });
  };
  return <div className="rich-editor">
    <div className="editor-toolbar" role="toolbar" aria-label="Article formatting">
      <ToolbarButton editor={editor} label="H2" active={editor?.isActive("heading", { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} />
      <ToolbarButton editor={editor} label="H3" active={editor?.isActive("heading", { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} />
      <ToolbarButton editor={editor} label="B" active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()} />
      <ToolbarButton editor={editor} label="I" active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()} />
      <ToolbarButton editor={editor} label="• List" active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()} />
      <ToolbarButton editor={editor} label="1. List" active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()} />
      <ToolbarButton editor={editor} label="Quote" active={editor?.isActive("blockquote")} onClick={() => editor?.chain().focus().toggleBlockquote().run()} />
      <ToolbarButton editor={editor} label="Link" active={editor?.isActive("link")} onClick={askForLink} />
      <ToolbarButton editor={editor} label="Image" onClick={askForImage} />
      <ToolbarButton editor={editor} label="Video" onClick={askForVideo} />
    </div>
    <EditorContent editor={editor} />
  </div>;
}
