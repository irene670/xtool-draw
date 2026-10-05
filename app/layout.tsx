import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./kiosk.css";
import { DEFAULT_CONFIG } from "@/lib/model";

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export const metadata: Metadata = {
  title: DEFAULT_CONFIG.eventName,
  description: "xtool 幸運輪大抽獎。現場成交限定，轉動幸運輪、抽取專屬好禮。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body className="antialiased">{children}</body>
    </html>
  );
}
