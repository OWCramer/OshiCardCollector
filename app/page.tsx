import Link from "next/link";
import { Button } from "@/components/Button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <main className="flex flex-col items-center gap-8 px-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Oshi Card Collector</h1>
        <p className="max-w-md text-lg opacity-65">
          Track and manage your card collection in one place.
        </p>
        <Button href="/all-cards">Get Started</Button>
        <Link href="/privacy-policy" className="text-sm opacity-50 hover:opacity-75">
          Privacy Policy
        </Link>
      </main>
    </div>
  );
}
