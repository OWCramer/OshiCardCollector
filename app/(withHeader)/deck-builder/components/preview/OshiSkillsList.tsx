import { Card } from "@/components/Card";

interface OshiSkill {
  name: string;
  skillType: string;
  effectText?: string | null;
  cost?: string | null;
  usageLimit?: string | null;
}

interface OshiSkillsListProps {
  oshiSkills: OshiSkill[];
}

function SPOshiBadge() {
  return (
    <p className="w-fit px-2 py-0.5 flex items-center rounded-full bg-linear-to-r from-purple-500 via-blue-400 to-pink-500 text-white text-xs font-medium">
      SP Oshi
    </p>
  );
}

function OshiBadge() {
  return (
    <p className="w-fit px-2 py-0.5 flex items-center rounded-full bg-pink-400 text-white text-xs font-medium">
      Oshi
    </p>
  );
}

export function OshiSkillsList({ oshiSkills }: OshiSkillsListProps) {
  if (oshiSkills.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold opacity-80">Oshi Skills</h2>
      {oshiSkills.map((skill, i) => (
        <Card key={i} className="flex flex-col gap-1 text-sm">
          <div className="font-medium flex flex-row gap-1 items-center">
            {skill.skillType === "OSHI" ? <OshiBadge /> : <SPOshiBadge />}
            <p className="flex flex-row gap-2 justify-between flex-1">
              <span>{skill.name}</span>
              <span>[holo Power: {skill.cost}]</span>
            </p>
          </div>
          {skill.effectText && (
            <p className="opacity-75 whitespace-pre-wrap">
              [{skill.usageLimit}] {skill.effectText}
            </p>
          )}
        </Card>
      ))}
    </div>
  );
}
