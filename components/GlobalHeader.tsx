"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { signOutUser } from "@/lib/firebase";
import { ThemeToggle } from "@/lib/theme-toggle";
import Image from "next/image";
import Button from "@/components/Button";

export default function GlobalHeader() {
  const { user } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOutUser();
    router.push("/");
  }

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {user?.photoURL && (
            <Image
              src={user.photoURL}
              alt="Profile image"
              width={32}
              height={32}
              className="h-8 w-8 rounded-full"
              referrerPolicy="no-referrer"
            />
          )}
          <span className="text-sm text-zinc-700 dark:text-zinc-300">{user?.displayName}</span>
        </div>
        <ThemeToggle />
        <Button onClick={handleSignOut} variant="transparent" highContrast>
          Sign Out
        </Button>
      </div>
    </header>
  );
}