import type { ReactNode } from "react";
import { classes } from "@/lib/classes";

interface PageProps {
  children: ReactNode;
  className?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  fullWidth?: boolean;
}

export function PageContainer({
  children,
  className,
  leading,
  trailing,
  fullWidth = false,
}: PageProps) {
  const hasToolbar = leading ?? trailing;

  return (
    <div className={classes("flex flex-1 flex-col mb-12", fullWidth && "w-full mb-2")}>
      {hasToolbar && !fullWidth && (
        <div className="relative z-20 flex items-center justify-between px-4 pt-2 mt-2 mb-2 xl:mb-0">
          {/* On xl both slots become absolute and float over the content area */}
          {leading && <div className="xl:absolute xl:top-2 xl:left-4">{leading}</div>}
          {trailing && <div className="xl:absolute xl:top-2 xl:right-4">{trailing}</div>}
        </div>
      )}
      <div
        className={classes(
          "flex-1 pb-2 pt-4 px-4 mx-auto w-full",
          !fullWidth && "max-w-4xl xl:pt-4 pb-8",
          !!hasToolbar && "pt-2",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
