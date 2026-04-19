import Link from "next/link";
import { Fragment } from "react";

interface LinkedCardTextProps {
  text: string | null | undefined;
  className?: string;
}

/**
 * Renders text, converting any 〈tag〉 segments into <Link>s that navigate to
 * /all-cards with the bracketed text pre-filled into the search filter.
 */
export function LinkedCardText({ text, className }: LinkedCardTextProps) {
  if (!text) return null;

  // Fresh regex each call — no shared mutable state
  const matches = Array.from(text.matchAll(/〈([^〉]+)〉/g));

  if (matches.length === 0) return <span className={className}>{text}</span>;

  const parts: React.ReactNode[] = [];
  let cursor = 0;

  matches.forEach((match, i) => {
    const inner = match[1];
    const start = match.index;
    const end = start + match[0].length;

    if (start > cursor) {
      parts.push(<Fragment key={`t-${i}`}>{text.slice(cursor, start)}</Fragment>);
    }

    parts.push(
      <Fragment key={`l-${i}`}>
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

    cursor = end;
  });

  if (cursor < text.length) {
    parts.push(<Fragment key="tail">{text.slice(cursor)}</Fragment>);
  }

  return <span className={className}>{parts}</span>;
}
