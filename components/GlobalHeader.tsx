"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { signOutUser } from "@/lib/firebase";
import Image from "next/image";
import { Menu, type MenuSection } from "@/components/Menu";
import { Button } from "@/components/Button";
import { classes } from "@/lib/classes";
import {
  ChevronDownIcon,
  HeartIcon,
  LayersIcon,
  LayoutListIcon,
  LibraryIcon,
  LogOutIcon,
  MenuIcon,
  MoonIcon,
  PlaySquareIcon,
  SquareStackIcon,
  SunIcon,
  SunMoonIcon,
  UserIcon,
  XIcon,
} from "lucide-react";

const MOBILE_NAV_ITEM_CLASS =
  "flex items-center gap-3 px-4 py-3 text-lg font-medium rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-150";

function MobileMenuOverlay({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    function handleResize() {
      if (window.innerWidth >= 768) onClose();
    }
    window.addEventListener("resize", handleResize);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("resize", handleResize);
    };
  }, [onClose]);

  function navigate(href: string) {
    router.push(href);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-zinc-950">
      {/* Header row — matches nav bar height */}
      <div className="relative flex h-15.25 items-center justify-between px-6 py-2 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <XIcon size={20} />
        </button>
        <span className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold">oshi.cards</span>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1 px-4 py-4">
        <button onClick={() => navigate("/all-cards")} className={MOBILE_NAV_ITEM_CLASS}>
          <PlaySquareIcon size={18} /> All Cards
        </button>
        <button onClick={() => navigate("/sets")} className={MOBILE_NAV_ITEM_CLASS}>
          <LayersIcon size={18} /> Sets
        </button>
        <button onClick={() => navigate("/deck-builder")} className={MOBILE_NAV_ITEM_CLASS}>
          <LayoutListIcon size={18} /> Deck Builder
        </button>

        <div className="mt-2 px-4 pb-1 text-xs font-semibold uppercase tracking-wider opacity-40">
          Collection
        </div>
        <button onClick={() => navigate("/lists")} className={MOBILE_NAV_ITEM_CLASS}>
          <HeartIcon size={18} /> Lists
        </button>
        <button onClick={() => navigate("/library")} className={MOBILE_NAV_ITEM_CLASS}>
          <LibraryIcon size={18} /> Library
        </button>
        <button onClick={() => navigate("/decks")} className={MOBILE_NAV_ITEM_CLASS}>
          <SquareStackIcon size={18} /> Decks
        </button>
      </nav>
    </div>
  );
}

const NAV_ITEM_CLASS =
  "flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-150 text-black dark:text-white";

function CollectionMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex shrink-0 items-center gap-2 h-9 px-4 rounded-xl text-black dark:text-white backdrop-blur-md backdrop-saturate-150 ring-1 ring-inset ring-black/10 dark:ring-white/15 hover:bg-black/10 dark:hover:bg-white/10 active:scale-[0.97] transition-all duration-150 cursor-pointer select-none"
      >
        Collection
        <ChevronDownIcon
          size={13}
          className={classes("opacity-60 transition-transform duration-150", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-40 rounded-xl bg-white dark:bg-zinc-900 ring-1 ring-inset ring-black/10 dark:ring-white/10 shadow-lg p-1 z-50">
          <Link href="/lists" onClick={() => setOpen(false)} className={NAV_ITEM_CLASS}>
            <HeartIcon size={14} /> Lists
          </Link>
          <Link href="/library" onClick={() => setOpen(false)} className={NAV_ITEM_CLASS}>
            <LibraryIcon size={14} /> Library
          </Link>
          <Link href="/decks" onClick={() => setOpen(false)} className={NAV_ITEM_CLASS}>
            <SquareStackIcon size={14} /> Decks
          </Link>
        </div>
      )}
    </div>
  );
}

export function GlobalHeader() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

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
      items: [
        { label: "Profile", icon: UserIcon, onClick: () => router.push("/user") },
        { label: "Sign Out", icon: LogOutIcon, onClick: handleSignOut },
      ],
    },
  ];

  const triggerNode = (
    <div className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-150">
      {user?.photoURL ? (
        <Image
          src={user.photoURL}
          alt="Profile"
          width={32}
          height={32}
          className="rounded-full"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
      )}
    </div>
  );

  return (
    <>
      {mobileOpen && <MobileMenuOverlay onClose={() => setMobileOpen(false)} />}

      <header className="fixed w-full h-15.25 z-40 flex items-center gap-3 border-b border-zinc-200 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-6 py-2 dark:border-zinc-800">
        {/* Hamburger — mobile only */}
        <button
          onClick={() => setMobileOpen(true)}
          className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          aria-label="Open menu"
        >
          <MenuIcon size={20} />
        </button>

        <Link
          href={user ? "/all-cards" : "/"}
          className="text-lg font-semibold hover:opacity-80 transition-opacity"
        >
          oshi.cards
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-2">
          <Button href="/all-cards" variant="transparent" highContrast>
            Cards
          </Button>
          <Button href="/sets" variant="transparent" highContrast>
            Sets
          </Button>
          <Button href="/deck-builder" variant="transparent" highContrast>
            Deck Builder
          </Button>
          <CollectionMenu />
        </nav>

        <div className="ml-auto flex items-center gap-1">
          {user ? (
            <Menu sections={sections} align="right" menuClassName="w-44">
              {triggerNode}
            </Menu>
          ) : (
            <Button href="/login" variant="transparent" highContrast>
              Sign in
            </Button>
          )}
        </div>
      </header>
    </>
  );
}
