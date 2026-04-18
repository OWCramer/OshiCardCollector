import { Fragment } from "react";
import { Accordion } from "@/components/Accordion";
import { Divider } from "@/components/Divider";

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
    <Accordion
      items={[
        {
          title: <span className="font-semibold opacity-80">Q&amp;A</span>,
          content: (
            <div className="flex flex-col gap-3 pt-1">
              {qna.map((item, i) => (
                <Fragment key={i}>
                  {i > 0 && <Divider />}
                  <div className="flex flex-col gap-1">
                    <p className="font-medium">Q: {item.question}</p>
                    <p className="opacity-75">A: {item.answer}</p>
                  </div>
                </Fragment>
              ))}
            </div>
          ),
        },
      ]}
    />
  );
}
