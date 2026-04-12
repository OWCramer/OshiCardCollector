import { GetAllCardsQuery } from "@/lib/generated/graphql";
import Image from "next/image";

type CardNode = GetAllCardsQuery["cards"]["nodes"][number];

export function ItemCard({ card }: { card: CardNode }) {
  return (
    <div>
      {card.imageUrl && (
        <Image loading="eager" src={card.imageUrl} alt={card.name} width={204} height={285} className="w-full h-auto" />
      )}
    </div>
  );
}
