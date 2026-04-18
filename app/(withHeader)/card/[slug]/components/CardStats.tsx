import Image from "next/image";
import { getArtCostImageSrc } from "@/components/Card";
import { Stat } from "./Stat";

interface CardStatsProps {
  hp?: number | null;
  life?: number | null;
  bloomLevel?: string | null;
  batonPass?: string[] | null;
}

export function CardStats({ hp, life, bloomLevel, batonPass }: CardStatsProps) {
  return (
    <>
      {!!hp && <Stat label="HP" value={hp} />}
      {!!life && <Stat label="Life" value={life} />}
      {bloomLevel && <Stat label="Bloom Level" value={bloomLevel} />}
      {batonPass && batonPass.length > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <span className="opacity-65 w-24 shrink-0">Baton Pass</span>
          <div className="flex gap-1">
            {batonPass.map((c, i) => (
              <Image key={i} src={getArtCostImageSrc(c)} alt={c} width={145} height={145} title={c} className="w-5 h-5" />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
