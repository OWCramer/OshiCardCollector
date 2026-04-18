import { GlobalHeader } from "@/components/GlobalHeader";
import { ReactNode } from "react";

export default function WithHeaderLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-dvh w-full">
      <nav>
        <GlobalHeader />
      </nav>
      <main className="mt-15.25">
        <div className="flex flex-col w-full max-w-full grow">{children}</div>
      </main>
    </div>
  );
}
