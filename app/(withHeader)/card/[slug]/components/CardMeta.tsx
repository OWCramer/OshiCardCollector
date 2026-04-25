import { classes } from "@/lib/classes";

interface CardMetaProps {
  illustrator?: string | null;
  releaseDate?: string | null;
  setNames?: string[];
  className?: string;
}

export function CardMeta({ illustrator, releaseDate, setNames, className }: CardMetaProps) {
  return (
    <div className={classes("flex flex-col gap-1 pt-2 border-t border-black/10 dark:border-white/10", className)}>
      {illustrator && <p className="text-xs opacity-65">Illustrator: {illustrator}</p>}
      {releaseDate && <p className="text-xs opacity-65">First Available: {releaseDate}</p>}
      {setNames && setNames.length > 0 && <p className="text-xs opacity-65">Sets: {setNames.join(", ")}</p>}
    </div>
  );
}
