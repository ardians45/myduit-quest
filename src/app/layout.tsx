import type { Metadata, Viewport } from "next";
import { Lilita_One, Nunito } from "next/font/google";
import "./globals.css";

const lilita = Lilita_One({ weight: "400", subsets: ["latin"], variable: "--font-lilita", display: "swap" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });

export const metadata: Metadata = {
  title: "Myduit Gweh",
  description: "Catat keuangan rasa main game: tiap catatan memberi XP, tiap anggaran yang terjaga memberi achievement.",
  manifest: "/manifest.webmanifest",
  applicationName: "Myduit Gweh",
  appleWebApp: { capable: true, title: "Myduit Gweh", statusBarStyle: "black-translucent" },
  icons: { icon: "/icons/icon.svg", apple: "/icons/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0e0d33",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${lilita.variable} ${nunito.variable}`}>
      <body>{children}</body>
    </html>
  );
}
