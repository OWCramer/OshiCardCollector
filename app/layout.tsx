import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import ApolloClientProvider from "@/lib/apollo-provider";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";

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
    <html
      lang="en"
      suppressHydrationWarning
      className="antialiased"
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme:dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`flex flex-col ${inter.variable}`}>
        <ApolloClientProvider>
          <ThemeProvider>
            <AuthProvider>
              <div id="app-root" className="flex flex-col flex-1">
                {children}
              </div>
            </AuthProvider>
          </ThemeProvider>
        </ApolloClientProvider>
        <div id="modal-root" />
      </body>
    </html>
  );
}
