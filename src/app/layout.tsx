import type { Metadata } from "next";
import { Syne, Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-accent",
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Rabbit Hole - Wikipedia Adventures",
  description: "Discover hidden gems in the Wikipedia universe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${cormorant.variable} ${dmSans.variable}`}
    >
      <body
        className="min-h-screen flex flex-col universe-bg antialiased"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {/* Distorted mesh grid background */}
        <svg
          className="mesh-overlay"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <filter id="warp">
              <feTurbulence
                type="turbulence"
                baseFrequency="0.015"
                numOctaves={3}
                seed={4}
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale={45}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
            <pattern
              id="mesh-grid"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="rgba(255,230,190,0.07)"
                strokeWidth="0.8"
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
            className="text-xl font-extrabold text-amber-100 hover:text-white transition-colors tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            rabbit hole
          </Link>
          <Link
            href="/collection"
            className="text-base text-amber-100/80 hover:text-white transition-colors"
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
