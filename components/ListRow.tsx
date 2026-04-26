"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, PencilIcon, TrashIcon } from "lucide-react";
import { classes } from "@/lib/classes";

interface ListRowProps {
  id: string;
  name: string;
  cardCount: number;
  canDelete: boolean;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export function ListRow({ id, name, cardCount, canDelete, onRename, onDelete }: ListRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function commitRename() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== name) onRename(id, trimmed);
    else setDraft(name);
    setEditing(false);
  }

  return (
    <div className="flex items-center gap-3 py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") { setDraft(name); setEditing(false); }
          }}
          onBlur={commitRename}
          className="flex-1 text-sm bg-transparent border-b border-zinc-300 dark:border-zinc-600 outline-none py-0.5"
        />
      ) : (
        <span className="flex-1 text-sm font-medium truncate">{name}</span>
      )}

      <span className="text-xs text-zinc-400 tabular-nums shrink-0">
        {cardCount} card{cardCount !== 1 ? "s" : ""}
      </span>

      <div className="flex items-center gap-1 shrink-0">
        {editing ? (
          <button
            onClick={commitRename}
            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
            aria-label="Save"
          >
            <CheckIcon size={14} />
          </button>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            aria-label="Rename"
          >
            <PencilIcon size={14} />
          </button>
        )}
        <button
          onClick={() => canDelete && onDelete(id)}
          disabled={!canDelete}
          title={canDelete ? "Delete list" : "Can't delete your only list"}
          className={classes(
            "p-1 rounded transition-colors",
            canDelete
              ? "hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500"
              : "opacity-30 cursor-not-allowed text-zinc-400"
          )}
          aria-label="Delete list"
        >
          <TrashIcon size={14} />
        </button>
      </div>
    </div>
  );
}
