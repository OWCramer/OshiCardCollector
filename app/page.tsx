import Link from "next/link";
import { Button } from "@/components/Button";
import { CardBackground } from "@/components/CardBackground";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center relative">
      <CardBackground />
      <main className="relative z-10 flex flex-col h-dvh justify-center items-center gap-8 px-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight">oshi.cards</h1>
        <p className="max-w-md text-lg opacity-65">
          Track, discover, and manage your popular vtuber card collection in one place.
        </p>
        <Button variant="transparent" highContrast href="/all-cards">
          Get Started
        </Button>
        <Link href="/privacy-policy" className="text-sm opacity-50 hover:opacity-75">
          Privacy Policy
        </Link>
      </main>
    </div>
  );
}
