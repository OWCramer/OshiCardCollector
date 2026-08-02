import pluralize from "pluralize";

/**
 * The single polite live region on the page. It doubles as the add receipt for
 * screen readers — deliberately the only one, since a per-row region would make
 * every keystroke announce twice.
 */
export function SessionSummary({
  totalCards,
  uniqueCount,
  unansweredCount,
}: {
  totalCards: number;
  uniqueCount: number;
  unansweredCount: number;
}) {
  return (
    <span aria-live="polite" aria-atomic="true" className="block text-xs text-balance opacity-75">
      {totalCards === 0
        ? "empty"
        : `${totalCards} ${pluralize("card", totalCards)} · ${uniqueCount} ${pluralize("row", uniqueCount)}`}
      {unansweredCount > 0 && (
        // Says why Save is disabled, rather than leaving a dead button.
        <span className="ml-2 font-medium text-amber-600 dark:text-amber-400">
          {unansweredCount} still {pluralize("need", unansweredCount)} a rarity
        </span>
      )}
    </span>
  );
}
