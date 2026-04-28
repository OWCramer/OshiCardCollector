"use client";

import { Card as CardContainer } from "@/components/Card";
import { memo, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/Input";
import { useVirtualizer } from "@tanstack/react-virtual";
import { type Card, useGetAllCardsQuery } from "@/generated/graphql";
import { OCG_CARD_SIZES, OCGCard } from "@/components/OCGCard";
import { EraserIcon, Loader2Icon, MinusIcon, PlusIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/Button";

const GAP = 16;
const { width: CARD_WIDTH, height: CARD_HEIGHT } = OCG_CARD_SIZES["lg"];

type CardWithQuantity = Partial<Card> & Pick<Card, "id" | "name"> & { quantity?: number };

function AddedCardButton({
  card,
  onRemove,
  changeQuantity,
}: {
  card: CardWithQuantity;
  onRemove: () => void;
  changeQuantity: (quantity: number) => void;
}) {
  const willDelete = (card.quantity ?? 1) === 1;
  return (
    <CardContainer className="p-0 ">
      <div className="p-1 z-10 relative h-[345px]">
        <OCGCard
          card={card}
          size="lg"
          overlayText={`${card.cardNumber} - ${card.rarity}`}
          className="absolute"
        />
      </div>
      <div className="flex items-center gap-0 w-62 pb-1 px-1">
        <Button
          icon={willDelete ? TrashIcon : MinusIcon}
          variant={willDelete ? "destructive" : "primary"}
          onClick={() => {
            if (willDelete) {
              onRemove();
              return;
            }
            changeQuantity((card.quantity ?? 1) - 1);
          }}
          className="rounded-r-none"
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
          className="w-full text-center items-center justify-center"
          style={{ textAlign: "center", borderRadius: "0" }}
        />
        <Button
          className="rounded-l-none"
          icon={PlusIcon}
          onClick={() => changeQuantity((card.quantity ?? 1) + 1)}
        />
      </div>
    </CardContainer>
  );
}

const VirtualAddedRow = memo(function VirtualRow({
  row,
  onRemove,
  onChange,
}: {
  row?: CardWithQuantity[];
  onRemove?: (card: CardWithQuantity) => void;
  onChange?: (card: CardWithQuantity, quantity: number) => void;
}) {
  return (
    <div className="flex gap-4 pb-4">
      {row?.map((card) => (
        <AddedCardButton
          changeQuantity={(quantity) => onChange?.(card, quantity)}
          key={card.id}
          card={card}
          onRemove={() => onRemove?.(card)}
        />
      ))}
    </div>
  );
});

const VirtualRow = memo(function VirtualRow({
  row,
  onAdd,
}: {
  row?: CardWithQuantity[];
  onAdd: (card: CardWithQuantity) => void;
}) {
  return (
    <div className="flex gap-4 pb-4">
      {row?.map((card) => (
        <OCGCard
          key={card.id}
          card={card}
          size="lg"
          onClick={() => onAdd(card)}
          overlayText={`${card.cardNumber} - ${card.rarity}`}
          className="cursor-pointer"
        />
      ))}
    </div>
  );
});

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

  const [containerWidth, setContainerWidth] = useState(0);
  const [addedContainerWidth, setAddedContainerWidth] = useState(0);

  useLayoutEffect(() => {
    const el = scrollParentRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    const el = addedCardScrollParentRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setAddedContainerWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, []);

  const columns = useMemo(() => {
    if (containerWidth === 0) return 1;
    return Math.max(1, Math.floor((containerWidth + GAP) / (CARD_WIDTH + GAP)));
  }, [containerWidth]);

  const addedColumns = useMemo(() => {
    if (addedContainerWidth === 0) return 1;
    return Math.max(1, Math.floor((addedContainerWidth + GAP) / (248 + GAP)));
  }, [addedContainerWidth]);

  const rows = useMemo(() => {
    const result: CardWithQuantity[][] = [];
    for (let i = 0; i < cards.length; i += columns) {
      result.push(cards.slice(i, i + columns));
    }
    return result;
  }, [cards, columns]);

  const addedRows = useMemo(() => {
    const result: CardWithQuantity[][] = [];
    for (let i = 0; i < addedCards.length; i += addedColumns) {
      result.push(addedCards.slice(i, i + addedColumns));
    }
    return result;
  }, [addedCards, addedColumns]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: cards.length,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: () => CARD_HEIGHT,
    overscan: 8,
  });

  const virtualizerAddedCards = useVirtualizer({
    count: addedCards.length,
    getScrollElement: () => addedCardScrollParentRef.current,
    estimateSize: () => 385,
    overscan: 8,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalVirtualHeight = virtualizer.getTotalSize();
  const virtualItemsAddedCards = virtualizerAddedCards.getVirtualItems();
  const totalVirtualHeightAddedCards = virtualizerAddedCards.getTotalSize();

  return (
    <section aria-label="Card Importer" className="p-6 flex flex-col h-[calc(100dvh-3.8125rem)]">
      <div className="flex flex-row w-full gap-6 h-full">
        <CardContainer className="w-full h-full flex flex-col gap-2 p-4 pb-0 overflow-hidden">
          <Input className="w-full shrink-0" placeholder="Search cards" />

          <div ref={scrollParentRef} className="overflow-y-scroll min-h-0">
            {loading ? (
              <div className="flex flex-1 items-center justify-center">
                <Loader2Icon className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="flex justify-center">
                <div
                  style={{
                    width: columns * CARD_WIDTH + (columns - 1) * GAP,
                    height: totalVirtualHeight,
                    position: "relative",
                  }}
                >
                  {virtualItems.map((virtualRow) => (
                    <div
                      key={virtualRow.key}
                      data-index={virtualRow.index}
                      ref={virtualizer.measureElement}
                      className="first:pt-4"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <VirtualRow
                        row={rows[virtualRow.index]}
                        onAdd={(card) => setAddedCards([...addedCards, card])}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
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
            {loading ? (
              <div className="flex flex-1 items-center justify-center">
                <Loader2Icon className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="flex justify-center">
                <div
                  style={{
                    width: addedColumns * 248 + (addedColumns - 1) * GAP,
                    height: totalVirtualHeightAddedCards,
                    position: "relative",
                  }}
                >
                  {virtualItemsAddedCards.map((virtualRow) => (
                    <div
                      key={virtualRow.key}
                      data-index={virtualRow.index}
                      ref={virtualizerAddedCards.measureElement}
                      className="first:pt-4"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <VirtualAddedRow
                        row={addedRows[virtualRow.index]}
                        onRemove={(card) => setAddedCards(addedCards.filter((c) => c !== card))}
                        onChange={(card, quantity) =>
                          setAddedCards(
                            addedCards.map((c) => (c === card ? { ...c, quantity } : c))
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContainer>
      </div>
    </section>
  );
}
