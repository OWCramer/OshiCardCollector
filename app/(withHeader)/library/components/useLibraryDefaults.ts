"use client";

import { useCallback, useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { LibraryDefaults } from "./types";

export function useLibraryDefaults(uid: string | null) {
  const [defaults, setDefaults] = useState<LibraryDefaults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    const ref = doc(db, "users", uid, "preferences", "library");
    getDoc(ref).then((snap) => {
      if (snap.exists()) setDefaults(snap.data() as LibraryDefaults);
      setLoading(false);
    });
  }, [uid]);

  const saveDefaults = useCallback(async (state: LibraryDefaults) => {
    if (!uid) return;
    const ref = doc(db, "users", uid, "preferences", "library");
    await setDoc(ref, state);
    setDefaults(state);
  }, [uid]);

  return { defaults, loading, saveDefaults };
}
