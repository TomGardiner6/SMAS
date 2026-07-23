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
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Save Me A Seat — London",
  description:
    "Stood up? Spare ticket? Drop a pin and a verified woman nearby will take that seat. Women-only, London-first. Join the waitlist.",
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
