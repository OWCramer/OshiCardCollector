"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { signOutUser } from "@/lib/firebase";
import Image from "next/image";
import { Menu, type MenuSection } from "@/components/Menu";
import { Button } from "@/components/Button";
import { LogOutIcon, MoonIcon, SunIcon, SunMoonIcon } from "lucide-react";

export function GlobalHeader() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  async function handleSignOut() {
    await signOutUser();
    router.push("/all-cards");
  }

  const sections: MenuSection[] = [
    {
      label: "Theme",
      items: [
        {
          label: "Light",
          icon: SunIcon,
          active: theme === "light",
          onClick: () => setTheme("light"),
        },
        {
          label: "Dark",
          icon: MoonIcon,
          active: theme === "dark",
          onClick: () => setTheme("dark"),
        },
        {
          label: "System",
          icon: SunMoonIcon,
          active: theme === "system",
          onClick: () => setTheme("system"),
        },
      ],
    },
    {
      label: "Account",
      items: [{ label: "Sign Out", icon: LogOutIcon, onClick: handleSignOut }],
    },
  ];

  const triggerNode = (
    <div className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-150 min-h-10">
      {user?.photoURL ? (
        <Image
          src={user.photoURL}
          alt="Profile image"
          width={28}
          height={28}
          className="rounded-full"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="h-7 w-7 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
      )}
      {user?.displayName ? (
        <span className="text-sm">{user.displayName}</span>
      ) : (
        <div className="h-3.5 w-24 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
      )}
    </div>
  );

  return (
    <header className="fixed w-full h-15.25 z-40 flex items-center justify-between border-b border-zinc-200 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-6 py-2 dark:border-zinc-800">
      <Link
        href={user ? "/all-cards" : "/"}
        className="text-lg font-semibold hover:opacity-80 transition-opacity"
      >
        oshi.cards
      </Link>
      {user ? (
        <Menu sections={sections} align="right" menuClassName="w-44">
          {triggerNode}
        </Menu>
      ) : (
        <Button href="/login" variant="transparent" highContrast>
          Sign in
        </Button>
      )}
    </header>
  );
}
