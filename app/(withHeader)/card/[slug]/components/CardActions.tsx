"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon, HeartIcon, MinusIcon, PlusIcon } from "lucide-react";
import { useLibrary } from "@/lib/library-context";
import { classes } from "@/lib/classes";
import { useFavorites } from "@/lib/favorites-context";
import { useAuth } from "@/lib/auth-context";
import { addCardToLibrary, setCardQuantity } from "@/api/library";
import { useRouter } from "next/navigation";

const DEBOUNCE_MS = 800;

interface ActionButtonProps {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  active?: boolean;
}

function ActionButton({ icon: Icon, label, onClick, active }: ActionButtonProps) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="flex items-center justify-center w-7 h-7 my-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-150 active:scale-[0.97]"
    >
      <Icon size={16} className="shrink-0" fill={active ? "currentColor" : "none"} />
    </button>
  );
}

function FavoriteButton({ cardId }: { cardId: number }) {
  const { user } = useAuth();
  const { lists, isInList, isInAnyList, addToList, removeFromList } = useFavorites();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const favorited = isInAnyList(cardId);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function handleHeartClick() {
    if (!user) {
      router.push("/login");
      return;
    }
    setOpen((prev) => !prev);
  }

  async function toggleList(listId: string) {
    if (!user) return;
    if (isInList(listId, cardId)) {
      await removeFromList(listId, cardId);
    } else {
      await addToList(listId, cardId);
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <ActionButton
        icon={HeartIcon}
        label={favorited ? "Manage favorites" : "Add to favorites"}
        active={favorited}
        onClick={handleHeartClick}
      />
      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 bg-white dark:bg-zinc-900 rounded-xl shadow-xl ring-1 ring-black/10 dark:ring-white/15 py-1.5 min-w-[168px]">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 px-3 pb-1 pt-0.5">
            Save to list
          </p>
          {lists.map((list) => {
            const inList = isInList(list.id, cardId);
            return (
              <button
                key={list.id}
                onClick={() => toggleList(list.id)}
                className="flex items-center gap-2.5 w-full px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm text-left transition-colors"
              >
                <span
                  className={classes(
                    "w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors",
                    inList ? "bg-rose-500 border-rose-500" : "border-zinc-300 dark:border-zinc-600"
                  )}
                >
                  {inList && <CheckIcon size={9} className="text-white" strokeWidth={3} />}
                </span>
                <span className="truncate flex-1">{list.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LibraryButton({ cardId }: { cardId: number }) {
  const { user } = useAuth();
  const { isInLibrary, getQuantity } = useLibrary();
  const router = useRouter();

  const inLibrary = isInLibrary(cardId);
  const remoteQuantity = getQuantity(cardId);

  const [localQuantity, setLocalQuantity] = useState(remoteQuantity);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasPendingWrite = useRef(false);

  useEffect(() => {
    if (!hasPendingWrite.current) setLocalQuantity(remoteQuantity);
  }, [remoteQuantity]);

  function scheduleWrite(newQuantity: number) {
    hasPendingWrite.current = true;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (user) setCardQuantity(user.uid, cardId, newQuantity);
      hasPendingWrite.current = false;
      debounceRef.current = null;
    }, DEBOUNCE_MS);
  }

  function flush() {
    if (!debounceRef.current || !user) return;
    clearTimeout(debounceRef.current);
    setLocalQuantity((qty) => {
      setCardQuantity(user.uid, cardId, qty);
      return qty;
    });
    hasPendingWrite.current = false;
    debounceRef.current = null;
  }

  useEffect(
    () => () => {
      flush();
    },
    [user]
  );
  useEffect(() => {
    window.addEventListener("beforeunload", flush);
    return () => window.removeEventListener("beforeunload", flush);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) {
    return (
      <ActionButton
        icon={PlusIcon}
        label="Add to collection"
        onClick={() => router.push("/login")}
      />
    );
  }

  if (!inLibrary && localQuantity === 0) {
    return (
      <ActionButton
        icon={PlusIcon}
        label="Add to collection"
        onClick={() => {
          addCardToLibrary(user.uid, cardId);
          setLocalQuantity(1);
        }}
      />
    );
  }

  return (
    <div className="flex items-center">
      <ActionButton
        icon={MinusIcon}
        label="Remove one"
        onClick={() => {
          const next = Math.max(0, localQuantity - 1);
          setLocalQuantity(next);
          scheduleWrite(next);
        }}
      />
      <span className="text-xs font-semibold w-5 text-center tabular-nums">{localQuantity}</span>
      <ActionButton
        icon={PlusIcon}
        label="Add one more"
        onClick={() => {
          const next = localQuantity + 1;
          setLocalQuantity(next);
          scheduleWrite(next);
        }}
      />
    </div>
  );
}

export function CardActions({ cardId, className }: { cardId: number; className?: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      className={classes(
        "flex items-center h-9 px-1 gap-0.5 rounded-xl backdrop-blur-md backdrop-saturate-150 ring-1 ring-inset ring-black/10 dark:ring-white/15 text-black dark:text-white",
        className
      )}
    >
      <FavoriteButton cardId={cardId} />
      <div className="w-px h-5 bg-black/10 dark:bg-white/10" />
      <LibraryButton cardId={cardId} />
      <div className="w-px h-5 bg-black/10 dark:bg-white/10" />
      <ActionButton
        icon={copied ? CheckIcon : CopyIcon}
        label={copied ? "Copied!" : "Copy link"}
        onClick={handleCopy}
      />
    </div>
  );
}
