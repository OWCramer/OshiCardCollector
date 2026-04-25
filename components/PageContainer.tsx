import type { ReactNode } from "react";
import { classes } from "@/lib/classes";

interface PageProps {
  children: ReactNode;
  className?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
}

export function PageContainer({ children, className, leading, trailing }: PageProps) {
  const hasToolbar = leading ?? trailing;

  return (
    <div className="flex flex-1 flex-col mb-12">
      {hasToolbar && (
        <div className="relative z-20 flex items-center justify-between px-4 pt-2 mt-2 mb-2 xl:mb-0">
          {/* On xl both slots become absolute and float over the content area */}
          <div className="xl:absolute xl:top-2 xl:left-4">{leading}</div>
          <div className="xl:absolute xl:top-2 xl:right-4">{trailing}</div>
        </div>
      )}
      <div className={classes("flex-1 pb-8 pt-2 xl:pt-4 px-4 max-w-4xl mx-auto w-full", className)}>
        {children}
      </div>
    </div>
  );
}
