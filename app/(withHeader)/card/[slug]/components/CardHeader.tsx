import { Badge } from "@/components/Badge";
import { getColorImageSrcs } from "@/components/CardIcons";
import Image from "next/image";
import Link from "next/link";


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
        <Link
          href={`/all-cards?search=${encodeURIComponent(name)}`}
          className="text-2xl font-bold hover:opacity-75 transition-opacity"
        >
          <h1>{name}</h1>
        </Link>
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
        <Badge href={`/all-cards?cardType=${encodeURIComponent(cardType)}`}>{cardType}</Badge>
        <Badge href={`/all-cards?rarity=${encodeURIComponent(rarity)}`}>{rarity}</Badge>
        {isBuzz && <Badge href="/all-cards?isBuzz=true">Buzz</Badge>}
        {isLimited && <Badge href="/all-cards?isLimited=true">Limited</Badge>}
        {tags?.map((tag) => (
          <Badge key={tag} href={`/all-cards?tags=${encodeURIComponent(tag)}`}>
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}
