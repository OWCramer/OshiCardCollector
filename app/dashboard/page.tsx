"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { signOutUser } from "@/lib/firebase";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOutUser();
    router.push("/");
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {user?.photoURL && (
              <img
                src={user.photoURL}
                alt=""
                className="h-8 w-8 rounded-full"
                referrerPolicy="no-referrer"
              />
            )}
            <span className="text-sm text-zinc-700 dark:text-zinc-300">
              {user?.displayName}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 p-6">
        <p className="text-zinc-600 dark:text-zinc-400">
          Welcome, {user?.displayName}. Your collection dashboard is ready.
        </p>
      </main>
    </div>
  );
}
