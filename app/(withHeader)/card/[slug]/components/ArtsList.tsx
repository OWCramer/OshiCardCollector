import Image from "next/image";
import { getArtCostImageSrc, getDamageBonusImageSrc } from "@/components/Card";

interface DamageBonus {
  amount?: string | null;
  colors?: string[] | null;
}

interface Art {
  name: string;
  damage?: string | null;
  cost?: string[] | null;
  effectText?: string | null;
  damageBonuses?: DamageBonus[] | null;
}

interface ArtsListProps {
  arts: Art[];
}

export function ArtsList({ arts }: ArtsListProps) {
  if (arts.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold opacity-80">Arts</h2>
      {arts.map((art, i) => (
        <div key={i} className="rounded-xl bg-black/5 dark:bg-white/5 p-3">
          <div className="flex flex-row justify-between items-center text-sm font-semibold">
            {art.cost && art.cost.length > 0 && (
              <div className="flex gap-1">
                {art.cost.map((c, j) => (
                  <Image
                    key={j}
                    src={getArtCostImageSrc(c)}
                    alt={c}
                    width={145}
                    height={145}
                    title={c}
                    className="w-5 h-5"
                  />
                ))}
              </div>
            )}
            <p>{art.name}</p>
            <div className="flex items-center gap-1.5">
              <p>{art.damage ?? "-"}</p>
              {art.damageBonuses?.map((bonus, k) => {
                const color = bonus.colors?.[0];
                const src = color ? getDamageBonusImageSrc(color) : null;
                if (!src) return null;
                return (
                  <Image
                    key={k}
                    src={src}
                    alt={color ?? "bonus"}
                    width={100}
                    height={34}
                    title={`+${bonus.amount ?? "?"} vs ${color}`}
                    className="h-3.5 w-auto"
                  />
                );
              })}
            </div>
          </div>

          {art.effectText && <p className="text-sm opacity-75 mt-1">{art.effectText}</p>}
        </div>
      ))}
    </div>
  );
}
