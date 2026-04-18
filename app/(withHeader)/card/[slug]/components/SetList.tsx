"use client";

import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "lucide-react";
import { Accordion } from "@/components/Accordion";
import { Fragment } from "react";

interface SetListProps {
  setNames: string[];
}

export function SetList({ setNames }: SetListProps) {
  if (setNames.length === 0) return null;

  const router = useRouter();

  return (
    <Accordion
      items={[
        {
          title: <span className="font-semibold opacity-80">Available in</span>,
          content: (
            <div className="flex flex-col">
              {setNames.map((name) => (
                <Fragment key={name}>
                  <button
                    onClick={() => router.push(`/all-cards?set=${encodeURIComponent(name)}`)}
                    className="group my-1.5 flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-left cursor-pointer ring-1 ring-black/10 dark:ring-white/10 transition-all duration-150 hover:bg-black/5 dark:hover:bg-white/5 hover:ring-black/20 dark:hover:ring-white/20 active:scale-[0.98]"
                  >
                    <span className="opacity-75 group-hover:opacity-100 transition-opacity">
                      {name}
                    </span>
                    <ArrowRightIcon
                      size={14}
                      className="shrink-0 opacity-40 translate-x-0 group-hover:opacity-75 group-hover:translate-x-0.5 transition-all duration-150"
                    />
                  </button>
                </Fragment>
              ))}
            </div>
          ),
        },
      ]}
    />
  );
}
