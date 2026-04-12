import { Badge } from "./Badge";
import { getColorImageSrc } from "@/components/Card";
import Image from "next/image";

interface CardHeaderProps {
  cardNumber: string;
  name: string;
  cardType: string;
  colors?: string[] | null;
  rarity: string;
  isBuzz?: boolean | null;
  isLimited?: boolean | null;
}

export function CardHeader({
  cardNumber,
  name,
  cardType,
  colors,
  rarity,
  isBuzz,
  isLimited,
}: CardHeaderProps) {
  return (
    <div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{cardNumber}</p>
      <div className="flex flex-row gap-1.5 items-center">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{name}</h1>
        {colors?.map((color) => (
          <Image
            key={color}
            src={getColorImageSrc(color)}
            alt={color}
            width={330}
            height={410}
            title={color}
            className="h-7 w-auto"
          />
        ))}
      </div>
      <div className="flex gap-2 mt-1 flex-wrap items-center">
        <Badge>{cardType}</Badge>
        <Badge>{rarity}</Badge>
        {isBuzz && <Badge>Buzz</Badge>}
        {isLimited && <Badge>Limited</Badge>}
      </div>
    </div>
  );
}
