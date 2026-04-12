interface Qna {
  question: string;
  answer: string;
}

interface QnaListProps {
  qna: Qna[];
}

export function QnaList({ qna }: QnaListProps) {
  if (qna.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Q&amp;A</h2>
      {qna.map((item, i) => (
        <div key={i} className="rounded-xl bg-black/5 dark:bg-white/5 p-3 text-sm flex flex-col gap-1">
          <p className="font-medium text-zinc-900 dark:text-white">{item.question}</p>
          <p className="text-zinc-600 dark:text-zinc-400">{item.answer}</p>
        </div>
      ))}
    </div>
  );
}
