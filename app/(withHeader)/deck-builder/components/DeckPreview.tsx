import { Card } from "@/components/Card";
import type { OCGCardData } from "@/components/OCGCard";

interface DeckPreviewProps {
  card?: OCGCardData | null;
}

export function DeckPreview({ card }: DeckPreviewProps) {
  return (
    <Card className="w-full h-full">
      {card ? (
        <div>
          <p>{card.id}</p>
          <p>{card.name}</p>
        </div>
      ) : (
        "Deck Preview"
      )}
    </Card>
  );
}
