import { CardContainer } from "@/components/CardContainer";
import { LinkedCardText } from "@/components/LinkedCardText";

interface Keyword {
  type: string;
  title: string;
  description: string;
}

interface KeywordsListProps {
  keywords: Keyword[];
}

function formatType(type: string): string {
  const label = type.charAt(0) + type.slice(1).toLowerCase();
  return type === "GIFT" ? label : `${label} Effect`;
}

export function KeywordsList({ keywords }: KeywordsListProps) {
  if (keywords.length === 0) return null;

  const grouped = keywords.reduce<Record<string, Keyword[]>>((acc, kw) => {
    (acc[kw.type] ??= []).push(kw);
    return acc;
  }, {});

  return (
    <>
      {Object.entries(grouped).map(([type, kws]) => (
        <div key={type} className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold opacity-80">{formatType(type)}</h2>
          {kws.map((kw, i) => (
            <CardContainer key={i}>
              <p className="text-sm font-semibold">{kw.title}</p>
              {kw.description && (
                <p className="text-sm opacity-75 mt-1 whitespace-pre-wrap">
                  <LinkedCardText text={kw.description} />
                </p>
              )}
            </CardContainer>
          ))}
        </div>
      ))}
    </>
  );
}
