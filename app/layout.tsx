import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import { LibraryProvider } from "@/lib/library-context";
import { FavoritesProvider } from "@/lib/favorites-context";
import { ThemeProvider } from "@/lib/theme-context";
import ApolloClientProvider from "@/lib/apollo-provider";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";
import { classes } from "@/lib/classes";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { HoverProvider } from "@/lib/hover-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Oshi Card Collector",
  description: "Hololive OCG Collection Manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="antialiased">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme:dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})()`,
          }}
        />
      </head>
      <body className={classes("flex flex-col min-h-dvh", inter.variable)}>
        <ApolloClientProvider>
          <HoverProvider>
            <ThemeProvider>
              <AuthProvider>
                <LibraryProvider>
                  <FavoritesProvider>
                    <div aria-label="App root" id="app-root" className="flex flex-col flex-1">
                      {children}
                    </div>
                  </FavoritesProvider>
                </LibraryProvider>
              </AuthProvider>
            </ThemeProvider>
          </HoverProvider>
        </ApolloClientProvider>
        <div id="modal-root" />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
