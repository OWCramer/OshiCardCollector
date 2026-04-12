import Image from "next/image";
import { getArtCostImageSrc } from "@/components/Card";

interface Art {
  name: string;
  damage?: number | null;
  cost?: string[] | null;
  effectText?: string | null;
}

interface ArtsListProps {
  arts: Art[];
}

export function ArtsList({ arts }: ArtsListProps) {
  if (arts.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Arts</h2>
      {arts.map((art, i) => (
        <div key={i} className="rounded-xl bg-black/5 dark:bg-white/5 p-3 text-sm">
          <p className="font-medium text-zinc-900 dark:text-white">
            {art.name} {art.damage != null && `— ${art.damage} dmg`}
          </p>
          {art.cost && art.cost.length > 0 && (
            <div className="flex gap-1 mt-1">
              {art.cost.map((c, j) => (
                <Image key={j} src={getArtCostImageSrc(c)} alt={c} width={20} height={20} title={c} />
              ))}
            </div>
          )}
          {art.effectText && (
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">{art.effectText}</p>
          )}
        </div>
      ))}
    </div>
  );
}
