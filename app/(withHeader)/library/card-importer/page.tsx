"use client";

import { Card as CardContainer } from "@/components/Card";
import { useMemo, useRef, useState } from "react";
import { Input } from "@/components/Input";
import { useVirtualizer } from "@tanstack/react-virtual";
import { type Card, useGetAllCardsQuery } from "@/generated/graphql";
import { OCGCard } from "@/components/OCGCard";
import { EraserIcon, Loader2Icon, MinusIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/Button";

const ROW_HEIGHT = 72;

type CardWithQuantity = Partial<Card> & Pick<Card, "id" | "name"> & { quantity?: number };

function CardRow({
  card,
  onAdd,
  onRemove,
  changeQuantity,
}: {
  card: CardWithQuantity;
  onAdd?: () => void;
  onRemove?: () => void;
  changeQuantity?: (quantity: number) => void;
}) {
  return (
    <div className="h-50 border-b border-black/10 dark:border-white/10 flex items-center justify-between px-2 pr-6">
      <div className="flex items-center gap-3">
        {onRemove && <Button variant="destructive" icon={EraserIcon} onClick={onRemove} />}
        <OCGCard card={card} size="xs" />
        <div className="flex flex-col">
          <h2 className="font-semibold">{card.name}</h2>
          <h3 className="text-sm">
            {card.cardNumber} - {card.rarity}
          </h3>
        </div>
      </div>

      {changeQuantity && (
        <div className="flex gap-1">
          <Button
            icon={MinusIcon}
            onClick={() => changeQuantity(Math.max(1, (card.quantity ?? 2) - 1))}
          />
          <Input
            value={card.quantity ?? 1}
            inputMode="numeric"
            onChange={(e) => {
              if (e.target.value === "") {
                changeQuantity(1);
                return;
              }
              if (Number.isNaN(Number(e.target.value))) {
                return;
              }
              changeQuantity(Number(e.target.value));
            }}
            className="w-16 text-center items-center justify-center"
            style={{ textAlign: "center" }}
          />
          <Button icon={PlusIcon} onClick={() => changeQuantity((card.quantity ?? 1) + 1)} />
        </div>
      )}
      {onAdd && <Button icon={PlusIcon} onClick={onAdd} />}
    </div>
  );
}

export default function CardImporterPage() {
  const [addedCards, setAddedCards] = useState<CardWithQuantity[]>([]);
  const { data, loading } = useGetAllCardsQuery({ variables: { pageSize: 0 } });
  const cards = useMemo(
    () =>
      data?.cards?.nodes?.filter(
        (card) => !addedCards.some((addedCard) => addedCard.id === card.id)
      ) ?? [],
    [addedCards, data?.cards?.nodes]
  );

  const scrollParentRef = useRef<HTMLDivElement>(null);
  const addedCardScrollParentRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: cards.length,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  });

  const virtualizerAddedCards = useVirtualizer({
    count: addedCards.length,
    getScrollElement: () => addedCardScrollParentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const virtualItemsAddedCards = virtualizerAddedCards.getVirtualItems();

  return (
    <section aria-label="Card Importer" className="p-6 flex flex-col h-[calc(100dvh-3.8125rem)]">
      <div className="flex flex-row w-full gap-6 h-full">
        <CardContainer className="w-full h-full flex flex-col gap-2 p-4 pb-0 overflow-hidden">
          <Input className="w-full shrink-0" placeholder="Search cards" />
          {loading ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2Icon className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div ref={scrollParentRef} className="overflow-y-scroll min-h-0">
              <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
                {virtualItems.map((virtualItem) => {
                  const card = cards[virtualItem.index];
                  return (
                    <div
                      key={virtualItem.key}
                      data-index={virtualItem.index}
                      ref={virtualizer.measureElement}
                      className="absolute left-0 top-0 w-full"
                      style={{ transform: `translateY(${virtualItem.start}px)` }}
                    >
                      <CardRow
                        card={card}
                        onAdd={() => {
                          setAddedCards((prev) => [...prev, { ...card, quantity: 1 }]);
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContainer>
        <CardContainer className="w-full flex flex-col gap-2 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Adding Cards...</h2>
            <Button
              variant="transparent"
              icon={EraserIcon}
              onClick={() => setAddedCards([])}
              disabled={addedCards.length === 0}
            >
              Clear
            </Button>
          </div>
          <div ref={addedCardScrollParentRef} className="overflow-y-scroll min-h-0">
            <div style={{ height: virtualizerAddedCards.getTotalSize(), position: "relative" }}>
              {virtualItemsAddedCards.map((virtualItem) => {
                const card = addedCards[virtualItem.index];
                return (
                  <div
                    key={virtualItem.key}
                    data-index={virtualItem.index}
                    ref={virtualizerAddedCards.measureElement}
                    className="absolute left-0 top-0 w-full"
                    style={{ transform: `translateY(${virtualItem.start}px)` }}
                  >
                    <CardRow
                      card={card}
                      onRemove={() => {
                        setAddedCards((prev) => prev.filter((c) => c !== card));
                      }}
                      changeQuantity={(quantity) => {
                        setAddedCards((prev) =>
                          prev.map((c) => (c.id === card.id ? { ...c, quantity } : c))
                        );
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </CardContainer>
      </div>
    </section>
  );
}
