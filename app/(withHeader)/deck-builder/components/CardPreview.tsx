import { Card } from "@/components/Card";
import type { OCGCardData } from "@/components/OCGCard";

interface CardPreviewProps {
  card?: OCGCardData | null;
}

export function CardPreview({ card }: CardPreviewProps) {
  return (
    <Card className="w-full h-full">
      {card ? (
        <div>
          <p>{card.id}</p>
          <p>{card.name}</p>
        </div>
      ) : (
        "Card Preview"
      )}
    </Card>
  );
}
