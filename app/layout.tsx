import type { Metadata } from "next";
import { Fraunces, Newsreader, Archivo } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  // Resolves the OG/Twitter image to an absolute URL so the link-preview
  // card renders when shared. Without this, Next falls back to
  // http://localhost:3000 and the card image is dead. Update if the site
  // ever moves to a custom domain.
  metadataBase: new URL("https://smas-pi.vercel.app"),
  title: "Save Me A Seat — London",
  description:
    "Stood up? Spare ticket? Drop a pin and a verified woman nearby will take that seat. Women-only, London-first. Join the waitlist.",
  openGraph: {
    title: "Save Me A Seat — London",
    description:
      "Company at short notice, for women in London. Drop a pin; someone nearby takes the seat.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Save Me A Seat — London",
    description:
      "Company at short notice, for women in London. Drop a pin; someone nearby takes the seat.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-GB"
      className={`${fraunces.variable} ${newsreader.variable} ${archivo.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
