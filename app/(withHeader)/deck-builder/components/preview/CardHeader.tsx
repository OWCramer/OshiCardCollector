import { Badge } from "@/components/Badge";
import { getColorImageSrcs } from "@/components/CardIcons";
import Image from "next/image";

interface CardHeaderProps {
  cardNumber: string;
  name: string;
  cardType: string;
  colors?: string[] | null;
  rarity: string;
  isBuzz?: boolean | null;
  isLimited?: boolean | null;
  tags?: string[] | null;
}

export function CardHeader({
  cardNumber,
  name,
  cardType,
  colors,
  rarity,
  isBuzz,
  isLimited,
  tags,
}: CardHeaderProps) {
  return (
    <div>
      <p className="text-sm opacity-65">{cardNumber}</p>
      <div className="flex flex-row gap-1.5 items-center">
        <h1 className="text-2xl font-bold">{name}</h1>
        {colors &&
          getColorImageSrcs(colors).map((src, i) => (
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
        {tags?.map((tag) => <Badge key={tag}>{tag}</Badge>)}
      </div>
    </div>
  );
}
