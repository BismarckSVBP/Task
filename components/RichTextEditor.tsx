"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
} from "lucide-react";



type ToolbarButtonProps = {
  onClick: () => void;
  icon: React.ComponentType<{ size?: number }>;
  title: string;
};

const ToolbarButton = ({
  onClick,
  icon: Icon,
  title,
}: ToolbarButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className="p-2 hover:bg-gray-100 rounded transition-colors"
    onMouseDown={(e) => e.preventDefault()}
  >
    <Icon size={16} />
  </button>
);


interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Type Your Reply...",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const execCommand = (command: string, commandValue?: string) => {
    document.execCommand(command, false, commandValue);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      editorRef.current.focus();
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="border-b bg-gray-50 flex items-center gap-1 p-2 flex-wrap">
        <ToolbarButton onClick={() => execCommand("undo")} icon={Undo} title="Undo" />
        <ToolbarButton onClick={() => execCommand("redo")} icon={Redo} title="Redo" />

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <ToolbarButton onClick={() => execCommand("bold")} icon={Bold} title="Bold" />
        <ToolbarButton onClick={() => execCommand("italic")} icon={Italic} title="Italic" />
        <ToolbarButton onClick={() => execCommand("underline")} icon={Underline} title="Underline" />
        <ToolbarButton
          onClick={() => execCommand("strikeThrough")}
          icon={Strikethrough}
          title="Strikethrough"
        />

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <ToolbarButton
          onClick={() => execCommand("justifyLeft")}
          icon={AlignLeft}
          title="Align Left"
        />
        <ToolbarButton
          onClick={() => execCommand("justifyCenter")}
          icon={AlignCenter}
          title="Align Center"
        />
        <ToolbarButton
          onClick={() => execCommand("justifyRight")}
          icon={AlignRight}
          title="Align Right"
        />

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <ToolbarButton
          onClick={() => execCommand("insertUnorderedList")}
          icon={List}
          title="Bullet List"
        />
        <ToolbarButton
          onClick={() => execCommand("insertOrderedList")}
          icon={ListOrdered}
          title="Numbered List"
        />
        <ToolbarButton
          onClick={() => execCommand("formatBlock", "blockquote")}
          icon={Quote}
          title="Quote"
        />
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="min-h-[300px] p-4 outline-none"
        style={{ whiteSpace: "pre-wrap" }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

    
      <style
        dangerouslySetInnerHTML={{
          __html: `
            [contenteditable][data-placeholder]:empty:before {
              content: attr(data-placeholder);
              color: #9ca3af;
              pointer-events: none;
            }
          `,
        }}
      />
    </div>
  );
}
