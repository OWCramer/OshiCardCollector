import { Badge } from "./Badge";
import { getColorImageSrcs } from "@/components/Card";
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
        {colors && getColorImageSrcs(colors).map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={colors[i] ?? ""}
            width={330}
            height={410}
            title={colors[i]}
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
