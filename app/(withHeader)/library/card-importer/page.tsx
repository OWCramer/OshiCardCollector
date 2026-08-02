"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { PageLoading } from "@/components/PageLoading";
import { useAuth } from "@/lib/auth-context";
import { useBreakpoint } from "@/lib/useBreakpoint";
import { useCardMap } from "@/lib/use-card-map";
import { useImporterStore } from "./importerStore";
import { buildCardGroups } from "./components/cardGroups";
import { ImporterDesktop } from "./components/ImporterDesktop";
import { ImporterMobile } from "./components/ImporterMobile";
import { useImporterController } from "./components/useImporterController";
import { useSaveSession } from "./components/useSaveSession";

/** The mounted flag never changes after hydration, so there's nothing to watch. */
const subscribeNever = () => () => {};

export default function CardImporterPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { cardMap, loading: cardsLoading } = useCardMap(!user);

  const status = useImporterStore((s) => s.status);
  const bindUid = useImporterStore((s) => s.bindUid);

  const isDesktop = useBreakpoint("md");
  // useBreakpoint reports false until its effect runs, so the very first paint
  // is always the mobile branch. Gate on mount to avoid a layout flash — the
  // catalog query and store hydration both outlast one tick anyway.
  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false
  );

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    void bindUid(user?.uid ?? null);
  }, [user?.uid, bindUid]);

  const index = useMemo(() => buildCardGroups(Object.values(cardMap)), [cardMap]);

  // Both the controller and the store live above the layout branch, so swapping
  // layouts mid-session preserves the draft, the query, and the selection.
  const ctl = useImporterController(index);
  const saver = useSaveSession();

  if (authLoading || !mounted || cardsLoading || status !== "ready") return <PageLoading />;
  if (!user) return null;

  return isDesktop ? (
    <ImporterDesktop ctl={ctl} saver={saver} />
  ) : (
    <ImporterMobile ctl={ctl} saver={saver} />
  );
}
