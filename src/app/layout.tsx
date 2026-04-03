import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import Link from "next/link";

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
  title: "Rabbit Hole — Wander Through Wikipedia and Discover Hidden Gems",
  description:
    "Connect random Wikipedia articles into surprising rabbit holes. Discover hidden gems, explore unexpected connections, and find what you never knew you were looking for.",
  metadataBase: new URL("https://rabbit-hole-zeta.vercel.app"),
  openGraph: {
    title: "Rabbit Hole — Wander Through Wikipedia and Discover Hidden Gems",
    description:
      "Connect random Wikipedia articles into surprising rabbit holes. Discover hidden gems, explore unexpected connections, and find what you never knew you were looking for.",
    siteName: "Rabbit Hole",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rabbit Hole — Wander Through Wikipedia and Discover Hidden Gems",
    description:
      "Connect random Wikipedia articles into surprising rabbit holes. Discover hidden gems, explore unexpected connections, and find what you never knew you were looking for.",
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
      <body
        className="min-h-screen flex flex-col universe-bg antialiased"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {/* Distorted mesh grid background */}
        <svg
          className="mesh-overlay"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <filter id="warp" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence
                type="turbulence"
                baseFrequency="0.012 0.012"
                numOctaves={3}
                seed={4}
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale={55}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
            <pattern
              id="mesh-grid"
              width="45"
              height="45"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 45 0 L 0 0 0 45"
                fill="none"
                stroke="rgba(241,132,235,0.35)"
                strokeWidth="0.7"
              />
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="url(#mesh-grid)"
            filter="url(#warp)"
          />
        </svg>

        <nav className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-8 py-5">
          <Link
            href="/"
            className="text-xl font-extrabold text-[#EF3922] hover:text-[#d42f1a] transition-colors tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            rabbit hole
          </Link>
          <Link
            href="/collection"
            className="text-base font-medium text-[#1a1520] hover:text-[#EF3922] transition-colors"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Collection
          </Link>
        </nav>
        <main className="flex-1 flex flex-col pt-16">{children}</main>
      </body>
    </html>
  );
}
