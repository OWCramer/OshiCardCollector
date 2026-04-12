import { GlobalHeader } from "@/components/GlobalHeader";
import { ReactNode } from "react";

export default function WithHeaderLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <GlobalHeader />
      <div className="flex flex-col flex-1">{children}</div>
    </div>
  );
}
