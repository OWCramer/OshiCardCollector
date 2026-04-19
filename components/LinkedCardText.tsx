import Link from "next/link";
import { Fragment } from "react";

interface LinkedCardTextProps {
  text: string | null | undefined;
  className?: string;
}

// Matches text surrounded by 〈...〉 (rendered as ⟨...⟩)
const BRACKET_REGEX = /〈([^〉]+)〉/g;

/**
 * Renders text, converting any 〈tag〉 segments into <Link>s that navigate to
 * /all-cards with the bracketed text pre-filled into the search filter.
 */
export function LinkedCardText({ text, className }: LinkedCardTextProps) {
  if (!text) return null;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  // Reset state for global regex
  BRACKET_REGEX.lastIndex = 0;

  while ((match = BRACKET_REGEX.exec(text)) !== null) {
    const [full, inner] = match;
    const start = match.index;
    const end = start + full.length;

    if (start > lastIndex) {
      parts.push(<Fragment key={key++}>{text.slice(lastIndex, start)}</Fragment>);
    }

    parts.push(
      <Fragment key={key++}>
        <span className="font-bold">⟨</span>
        <Link
          href={`/all-cards?search=${encodeURIComponent(inner)}`}
          className="font-semibold hover:opacity-75 transition-opacity"
        >
          {inner}
        </Link>
        <span className="font-bold">⟩</span>
      </Fragment>
    );

    lastIndex = end;
  }

  if (lastIndex < text.length) {
    parts.push(<Fragment key={key++}>{text.slice(lastIndex)}</Fragment>);
  }

  return <span className={className}>{parts}</span>;
}
