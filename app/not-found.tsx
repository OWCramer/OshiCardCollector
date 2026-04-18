import { Button } from "@/components/Button";
import Image from "next/image";
import { GoblinLink } from "./GoblinLink";
import Link from "next/link";

async function getFubuki() {
  try {
    const res = await fetch("https://api.oshi.cards/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query { card(id: 404) { name imageUrl } }`,
      }),
      next: { revalidate: 86400 },
    });
    const json = await res.json();
    return json?.data?.card ?? null;
  } catch {
    return null;
  }
}

export default async function NotFound() {
  const card = await getFubuki();

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-col items-center gap-6 px-6 text-center">
        <p className="text-8xl font-bold tracking-tight text-zinc-200 dark:text-zinc-800 select-none">
          404
        </p>

        {card?.imageUrl && (
          <Link href="/card/404" className="group block">
            <div className="relative transition-transform duration-300 group-hover:scale-103">
              <Image
                src={card.imageUrl}
                alt={card.name}
                width={240}
                height={335}
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-zinc-900 dark:bg-zinc-50 px-3 py-1 text-xs font-semibold text-white dark:text-zinc-900 shadow">
                Card #404
              </div>
            </div>
          </Link>
        )}

        <div className="flex flex-col gap-1 mt-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Page not found
          </h1>
          <p className="opacity-60">
            The <GoblinLink /> must have stolen this card.
          </p>
        </div>

        <Button href="/dashboard" variant="transparent" highContrast>
          Back to dashboard
        </Button>
      </main>
    </div>
  );
}
