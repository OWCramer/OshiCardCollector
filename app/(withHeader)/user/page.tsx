"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, PencilIcon, PlusIcon, TrashIcon, XIcon } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { classes } from "@/lib/classes";
import { useFavorites } from "@/lib/favorites-context";

function ListRow({
  id,
  name,
  cardCount,
  canDelete,
  onRename,
  onDelete,
}: {
  id: string;
  name: string;
  cardCount: number;
  canDelete: boolean;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}) {
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

export default function UserPage() {
  const { user } = useAuth();
  const { lists, cardsByList, createList, deleteList, renameList } = useFavorites();

  const [newListName, setNewListName] = useState("");
  const [creating, setCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (creating) inputRef.current?.focus();
  }, [creating]);

  async function handleCreate() {
    const name = newListName.trim();
    if (!name) return;
    await createList(name);
    setNewListName("");
    setCreating(false);
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 p-6 max-w-lg">
        <p className="opacity-65 mb-8">
          Welcome, {user?.displayName}. Your collection dashboard is ready.
        </p>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Favorite Lists</h2>
            <button
              onClick={() => setCreating((v) => !v)}
              className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            >
              {creating ? <XIcon size={13} /> : <PlusIcon size={13} />}
              {creating ? "Cancel" : "New list"}
            </button>
          </div>

          {creating && (
            <div className="flex gap-2 mb-3">
              <input
                ref={inputRef}
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") { setNewListName(""); setCreating(false); }
                }}
                placeholder="List name…"
                className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
              />
              <button
                onClick={handleCreate}
                disabled={!newListName.trim()}
                className="px-3 py-1.5 text-sm rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium disabled:opacity-40"
              >
                Create
              </button>
            </div>
          )}

          <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 px-3">
            {lists.length === 0 ? (
              <p className="text-sm text-zinc-500 py-4 text-center">No lists yet.</p>
            ) : (
              lists.map((list) => (
                <ListRow
                  key={list.id}
                  id={list.id}
                  name={list.name}
                  cardCount={Object.keys(cardsByList[list.id] ?? {}).length}
                  canDelete={lists.length > 1}
                  onRename={(id, name) => renameList(id, name)}
                  onDelete={(id) => deleteList(id)}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
