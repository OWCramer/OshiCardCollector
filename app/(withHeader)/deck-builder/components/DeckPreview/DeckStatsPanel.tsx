import { useState } from "react";
import { OCGCard } from "@/components/OCGCard";
import { Button } from "@/components/Button";
import { Divider } from "@/components/Divider";
import { Modal } from "@/components/Modal";
import { classes } from "@/lib/classes";
import { type FullCardEntry } from "../CardLibrary";
import { DECK_LIMITS, type DeckStats } from "../useDeckRules";
import { OSHI_H, OSHI_SCALE, OSHI_W } from "./types";

function StatRow({ label, value, max }: { label: string; value: number; max: number }) {
  const over = value > max;
  return (
    <div className="flex items-center gap-1.5 text-sm">
      <span className="opacity-50 w-20 shrink-0">{label}</span>
      <span className={classes("font-medium tabular-nums", over && "text-red-500")}>{value}</span>
      <span className="opacity-30">/ {max}</span>
    </div>
  );
}

interface DeckStatsPanelProps {
  stats: DeckStats;
  onRemoveOshi: () => void;
  onCardHover?: (card: FullCardEntry | null) => void;
  canAutofillCheer: boolean;
  onAutofillCheer: () => void;
}

export function DeckStatsPanel({
  stats,
  onRemoveOshi,
  onCardHover,
  canAutofillCheer,
  onAutofillCheer,
}: DeckStatsPanelProps) {
  const oshiCard = stats.oshiEntry?.card ?? null;
  const [showAutofillConfirm, setShowAutofillConfirm] = useState(false);

  return (
    <div className="shrink-0">
      <Divider className="mb-3" />
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {oshiCard ? (
            <div style={{ width: OSHI_W, height: OSHI_H, overflow: "hidden", flexShrink: 0 }}>
              <div style={{ transform: `scale(${OSHI_SCALE})`, transformOrigin: "top left" }}>
                <OCGCard
                  card={oshiCard}
                  size="xs"
                  shine={false}
                  tiltFactor={0}
                  scaleFactor={1}
                  glareIntensity={0}
                  onClick={onRemoveOshi}
                  onHover={(isHovered) => onCardHover?.(isHovered ? oshiCard : null)}
                  className="hover:opacity-75 transition-opacity"
                />
              </div>
            </div>
          ) : (
            <div
              style={{ width: OSHI_W, height: OSHI_H }}
              className="shrink-0 rounded-[4.55%/3.5%] ring-1 ring-inset ring-black/15 dark:ring-white/15 bg-black/5 dark:bg-white/5 flex items-center justify-center text-[10px] opacity-40 text-center px-1"
            >
              No Oshi
            </div>
          )}

          <div className="flex flex-col gap-1 justify-center py-1">
            <StatRow label="Oshi" value={stats.oshiEntry ? 1 : 0} max={DECK_LIMITS.oshi} />
            <StatRow label="Main" value={stats.main} max={DECK_LIMITS.main} />
            <StatRow label="Cheer" value={stats.cheer} max={DECK_LIMITS.cheer} />
            <StatRow label="Total" value={stats.total} max={DECK_LIMITS.total} />
          </div>
        </div>

        {canAutofillCheer && (
          <Button variant="transparent" highContrast onClick={() => setShowAutofillConfirm(true)} className="self-end">
            Auto-pick cheers
          </Button>
        )}

        <Modal title="Auto-pick cheers?" isOpen={showAutofillConfirm} onClose={() => setShowAutofillConfirm(false)}>
          <div className="flex flex-col gap-4">
            <p className="text-sm opacity-75">
              Auto-pick makes its best guess based on your cards&apos; art costs, but may not always choose the right cheers. Review your cheer cards afterward to make sure they match your deck.
            </p>
            <p className="text-sm opacity-75">
              Any cheer cards already in your deck will be replaced.
            </p>
            <div className="flex gap-2">
              <Button variant="transparent" highContrast className="flex-1" onClick={() => setShowAutofillConfirm(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={() => { onAutofillCheer(); setShowAutofillConfirm(false); }}>
                Auto-pick
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
