interface OshiSkill {
  name: string;
  skillType: string;
  effectText?: string | null;
}

interface OshiSkillsListProps {
  oshiSkills: OshiSkill[];
}

export function OshiSkillsList({ oshiSkills }: OshiSkillsListProps) {
  if (oshiSkills.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Oshi Skills</h2>
      {oshiSkills.map((skill, i) => (
        <div key={i} className="rounded-xl bg-black/5 dark:bg-white/5 p-3 text-sm">
          <p className="font-medium text-zinc-900 dark:text-white">
            {skill.name}{" "}
            <span className="text-xs text-zinc-400">({skill.skillType})</span>
          </p>
          {skill.effectText && (
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">{skill.effectText}</p>
          )}
        </div>
      ))}
    </div>
  );
}
