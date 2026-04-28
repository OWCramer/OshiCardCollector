import { GlobalHeader } from "@/components/GlobalHeader";
import { ReactNode } from "react";

export default function WithHeaderLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh w-full flex flex-col">
      <nav aria-label="Global header navigation" className="shrink-0">
        <GlobalHeader />
      </nav>
      <main aria-label="Main content" className="mt-15.25 flex flex-col flex-1">
        <div className="flex flex-col flex-1 w-full max-w-full">{children}</div>
      </main>
    </div>
  );
}
