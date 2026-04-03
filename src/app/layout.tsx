import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import WarpedGrid from "./components/WarpedGrid";

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Rabbit Hole — Wander Through Wikipedia",
  description:
    "Connect random Wikipedia articles into surprising rabbit holes. Discover hidden gems and explore unexpected connections.",
  metadataBase: new URL("https://rabbit-hole-zeta.vercel.app"),
  openGraph: {
    title: "Rabbit Hole — Wander Through Wikipedia",
    description:
      "Connect random Wikipedia articles into surprising rabbit holes. Discover hidden gems and explore unexpected connections.",
    siteName: "Rabbit Hole",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rabbit Hole — Wander Through Wikipedia",
    description:
      "Connect random Wikipedia articles into surprising rabbit holes. Discover hidden gems and explore unexpected connections.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable}`}
    >
      <body className="min-h-screen flex flex-col universe-bg antialiased font-body">
        <WarpedGrid />

        <nav className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-8 py-5">
          <Link
            href="/"
            className="text-xl font-extrabold text-brand hover:text-brand-hover transition-colors tracking-tight font-display"
          >
            rabbit hole
          </Link>
          <Link
            href="/collection"
            className="text-base font-medium text-foreground hover:text-brand transition-colors font-body"
          >
            Collection
          </Link>
        </nav>
        <main className="flex-1 flex flex-col pt-16">{children}</main>
      </body>
    </html>
  );
}
