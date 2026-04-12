import Image from "next/image";
import { getColorImageSrc } from "@/components/Card";
import { Badge } from "./Badge";

interface CardHeaderProps {
  cardNumber: string;
  name: string;
  cardType: string;
  color: string;
  rarity: string;
  isBuzz?: boolean | null;
  isLimited?: boolean | null;
}

export function CardHeader({ cardNumber, name, cardType, color, rarity, isBuzz, isLimited }: CardHeaderProps) {
  return (
    <div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{cardNumber}</p>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{name}</h1>
      <div className="flex gap-2 mt-1 flex-wrap items-center">
        <Badge>{cardType}</Badge>
        <Image src={getColorImageSrc(color)} alt={color} width={24} height={24} title={color} />
        <Badge>{rarity}</Badge>
        {isBuzz && <Badge>Buzz</Badge>}
        {isLimited && <Badge>Limited</Badge>}
      </div>
    </div>
  );
}
