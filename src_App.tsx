import React, { useEffect, useState } from "react";
import Editor from "./Editor";
import { v4 as uuidv4 } from "uuid";

type Doc = {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
};

const STORAGE_KEY = "minimal-docs";

function loadDocs(): Doc[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const demo: Doc = {
        id: uuidv4(),
        title: "Welcome",
        content: "# Welcome\n\nThis is your first document. Edit this Markdown on the left.",
        updatedAt: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify([demo]));
      return [demo];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export default function App() {
  const [docs, setDocs] = useState<Doc[]>(() => loadDocs());
  const [activeId, setActiveId] = useState<string | null>(docs[0]?.id ?? null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  }, [docs]);

  function createDoc() {
    const newDoc: Doc = { id: uuidv4(), title: "Untitled", content: "", updatedAt: Date.now() };
    setDocs((d) => [newDoc, ...d]);
    setActiveId(newDoc.id);
  }

  function updateDoc(updated: Partial<Doc> & { id: string }) {
    setDocs((list) =>
      list.map((d) => (d.id === updated.id ? { ...d, ...updated, updatedAt: Date.now() } : d))
    );
  }

  function deleteDoc(id: string) {
    const idx = docs.findIndex((d) => d.id === id);
    if (idx === -1) return;
    const newDocs = docs.filter((d) => d.id !== id);
    setDocs(newDocs);
    if (activeId === id) setActiveId(newDocs[0]?.id ?? null);
  }

  const activeDoc = docs.find((d) => d.id === activeId) ?? null;

  return (
    <div className="app">
      <aside className="sidebar">
        <header className="sidebar-header">
          <h1>Documents</h1>
          <div>
            <button onClick={createDoc}>New</button>
          </div>
        </header>
        <ul className="doc-list">
          {docs.map((d) => (
            <li
              key={d.id}
              className={d.id === activeId ? "active" : ""}
              onClick={() => setActiveId(d.id)}
            >
              <div className="doc-title">{d.title || "Untitled"}</div>
              <div className="doc-meta">{new Date(d.updatedAt).toLocaleString()}</div>
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete "${d.title}"?`)) deleteDoc(d.id);
                }}
                title="Delete"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main className="editor-area">
        {activeDoc ? (
          <Editor
            key={activeDoc.id}
            doc={activeDoc}
            onChange={(payload) => updateDoc(payload)}
            onDelete={() => {
              if (confirm(`Delete "${activeDoc.title}"?`)) deleteDoc(activeDoc.id);
            }}
          />
        ) : (
          <div className="empty">No document selected. Create a new document.</div>
        )}
      </main>
    </div>
  );
}