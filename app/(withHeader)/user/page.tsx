"use client";

import { useAuth } from "@/lib/auth-context";

export default function UserPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="flex-1 p-6">
        <p className="text-zinc-600 dark:text-zinc-400">
          Welcome, {user?.displayName}. Your collection dashboard is ready.
        </p>
      </main>
    </div>
  );
}
