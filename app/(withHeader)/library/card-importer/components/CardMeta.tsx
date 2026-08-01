import Image from "next/image";
import { getColorImageSrcs } from "@/components/CardIcons";
import { classes } from "@/lib/classes";

/**
 * The shared meta line under a card name: collector number, colour icons, and
 * (optionally) the card type. Used by both search results and ledger rows.
 */
export function CardMeta({
  cardNumber,
  colors,
  cardType,
  setName,
  iconSize = 15,
  className,
  children,
}: {
  cardNumber: string;
  colors: string[];
  cardType?: string;
  /** Which set this printing came from — the same card number can be reprinted. */
  setName?: string;
  iconSize?: number;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={classes("flex items-center gap-2 min-w-0", className)}>
      <span className="font-mono text-[11.5px] leading-none opacity-75">
        {cardNumber}
      </span>
      {colors.length > 0 && (
        <span className="flex shrink-0 gap-[3px]">
          {getColorImageSrcs(colors).map((src) => (
            // Decorative — the colour is not information the sighted-only user
            // gets either, and the card name already identifies the card.
            <Image key={src} src={src} alt="" width={iconSize} height={iconSize} />
          ))}
        </span>
      )}
      {cardType && (
        <span className="shrink-0 text-[11.5px] leading-none opacity-75">
          {cardType}
        </span>
      )}
      {setName && (
        <span className="min-w-0 truncate text-[11.5px] leading-none opacity-75">
          {setName}
        </span>
      )}
      {children}
    </div>
  );
}
