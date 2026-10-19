import type { Metadata } from "next";
import { Plus_Jakarta_Sans, IBM_Plex_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const serif = Instrument_Serif({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

import { BackgroundMusic } from "@/components/audio/background-music";

export const metadata: Metadata = {
  title: "Rekonstruksi Prompt: Permainan Tebak Instruksi Antar Tim",
  description:
    "Permainan tebak prompt gambar antar tim dengan Cloudflare Workers AI image generator.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${jakarta.variable} ${mono.variable} ${serif.variable} font-sans antialiased min-h-screen flex flex-col justify-between`}
      >
        {children}
        <BackgroundMusic />
      </body>
    </html>
  );
}
