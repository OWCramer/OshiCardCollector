interface CardMetaProps {
  illustrator?: string | null;
  releaseDate?: string | null;
  setNames: string[];
}

export function CardMeta({ illustrator, releaseDate, setNames }: CardMetaProps) {
  return (
    <div className="flex flex-col gap-1 mt-auto pt-2 border-t border-black/10 dark:border-white/10">
      {illustrator && <p className="text-xs text-zinc-400">Illustrator: {illustrator}</p>}
      {releaseDate && <p className="text-xs text-zinc-400">Released: {releaseDate}</p>}
      {setNames.length > 0 && <p className="text-xs text-zinc-400">Sets: {setNames.join(", ")}</p>}
    </div>
  );
}
