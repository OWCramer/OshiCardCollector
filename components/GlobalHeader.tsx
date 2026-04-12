"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { signOutUser } from "@/lib/firebase";
import Image from "next/image";
import Menu, { type MenuSection } from "@/components/Menu";
import { LogOutIcon, MoonIcon, SunIcon, SunMoonIcon } from "lucide-react";

export default function GlobalHeader() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  async function handleSignOut() {
    await signOutUser();
    router.push("/");
  }

  const sections: MenuSection[] = [
    {
      label: "Theme",
      items: [
        { label: "Light", icon: SunIcon, active: theme === "light", onClick: () => setTheme("light") },
        { label: "Dark", icon: MoonIcon, active: theme === "dark", onClick: () => setTheme("dark") },
        { label: "System", icon: SunMoonIcon, active: theme === "system", onClick: () => setTheme("system") },
      ],
    },
    {
      label: "Account",
      items: [
        { label: "Sign Out", icon: LogOutIcon, onClick: handleSignOut },
      ],
    },
  ];

  const triggerNode = (
    <div className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-150">
      {user?.photoURL && (
        <Image
          src={user.photoURL}
          alt="Profile image"
          width={28}
          height={28}
          className="rounded-full"
          referrerPolicy="no-referrer"
        />
      )}
      <span className=" text-zinc-700 dark:text-zinc-300">{user?.displayName}</span>
    </div>
  );

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-2 dark:border-zinc-800 dark:bg-zinc-950">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
      <Menu sections={sections} align="right" menuClassName="w-44">
        {triggerNode}
      </Menu>
    </header>
  );
}
