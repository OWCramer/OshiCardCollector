import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-col items-center gap-8 px-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Oshi Card Collector
        </h1>
        <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
          Track and manage your card collection in one place.
        </p>
        <Link
          href="/dashboard"
          className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Get Started
        </Link>
      </main>
    </div>
  );
}
