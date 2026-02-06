"use client";

import { useRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "@/lib/utils";
import { Bold, Italic, List, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";

type RichTextEditorProps = {
  name: string;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  defaultValue?: string;
  className?: string;
  minHeight?: string;
};

export function RichTextEditor({
  name,
  id,
  placeholder,
  disabled = false,
  defaultValue = "",
  className,
  minHeight = "6rem",
}: RichTextEditorProps) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: placeholder ?? "" }),
    ],
    content: defaultValue?.trim() ? defaultValue : "<p></p>",
    editable: !disabled,
    editorProps: {
      attributes: {
        class:
          "tiptap border-input placeholder:text-muted-foreground focus:outline-none min-w-0 flex-1 px-3 py-2 text-base md:text-sm prose prose-sm dark:prose-invert max-w-none",
        style: `min-height: ${minHeight}`,
      },
    },
    onUpdate: ({ editor }) => {
      const input = hiddenInputRef.current;
      if (!input) return;
      const html = editor.getHTML();
      input.value =
        html === "<p></p>" || html === "<p><br></p>" ? "" : html;
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  useEffect(() => {
    if (!editor || !hiddenInputRef.current) return;
    const html = editor.getHTML();
    hiddenInputRef.current.value =
      html === "<p></p>" || html === "<p><br></p>" ? "" : html;
  }, [editor]);

  if (!editor) return null;

  return (
    <div
      className={cn(
        "border-input focus-within:border-ring focus-within:ring-ring/50 flex flex-col rounded-md border bg-transparent shadow-xs transition-[color,box-shadow] focus-within:ring-[3px] disabled:opacity-50",
        className
      )}
    >
      <input
        ref={hiddenInputRef}
        type="hidden"
        name={name}
        defaultValue={defaultValue?.trim() || ""}
      />
      <div className="flex flex-wrap items-center gap-0.5 border-b border-input px-1 py-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={disabled}
          aria-label="Gras"
        >
          <Bold className="h-3.5 w-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={disabled}
          aria-label="Italique"
        >
          <Italic className="h-3.5 w-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={disabled}
          aria-label="Liste à puces"
        >
          <List className="h-3.5 w-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={disabled}
          aria-label="Liste numérotée"
        >
          <ListOrdered className="h-3.5 w-3" />
        </Button>
      </div>
      <EditorContent editor={editor} id={id} />
    </div>
  );
}
