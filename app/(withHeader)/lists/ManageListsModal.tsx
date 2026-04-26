"use client";

import { useEffect, useRef, useState } from "react";
import { PlusIcon, XIcon } from "lucide-react";
import { useFavorites } from "@/lib/favorites-context";
import { Modal } from "@/components/Modal";
import { ListRow } from "@/components/ListRow";

interface ManageListsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManageListsModal({ isOpen, onClose }: ManageListsModalProps) {
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
    <Modal isOpen={isOpen} onClose={onClose} title="Manage lists">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-zinc-500">{lists.length} list{lists.length !== 1 ? "s" : ""}</p>
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
    </Modal>
  );
}
