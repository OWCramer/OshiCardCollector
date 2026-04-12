import GlobalHeader from "@/components/GlobalHeader";
import { ReactNode } from "react";

export default function WithHeaderLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <GlobalHeader />
      {children}
    </>
  );
}
