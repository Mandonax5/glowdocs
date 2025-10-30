import React, { useEffect, useMemo, useState } from "react";
import { marked } from "marked";

type Doc = {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
};

export default function Editor({
  doc,
  onChange,
  onDelete
}: {
  doc: Doc;
  onChange: (payload: Partial<Doc> & { id: string }) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(doc.title);
  const [content, setContent] = useState(doc.content);

  useEffect(() => {
    setTitle(doc.title);
    setContent(doc.content);
  }, [doc.id]);

  // auto-save with debounce
  useEffect(() => {
    const id = setTimeout(() => {
      if (title !== doc.title) onChange({ id: doc.id, title });
      if (content !== doc.content) onChange({ id: doc.id, content });
    }, 400);
    return () => clearTimeout(id);
  }, [title, content]);

  const html = useMemo(() => marked.parse(content || ""), [content]);

  function exportMD() {
    const blob = new Blob([`# ${title}\n\n${content}`], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (title || "document") + ".md";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="editor-wrapper">
      <div className="editor-topbar">
        <input
          className="title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Document title"
        />
        <div className="top-actions">
          <button onClick={exportMD}>Export .md</button>
          <button onClick={onDelete}>Delete</button>
        </div>
      </div>

      <div className="editor-split">
        <textarea
          className="editor-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write Markdown..."
        />
        <div className="preview" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}