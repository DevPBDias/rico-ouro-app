import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ServiceWorkerUpdater from "@/components/sync/ServiceWorkerUpdater";
import SyncManager from "@/components/sync/SyncManager";
import DatabaseInitializer from "@/components/sync/DatabaseInitializer";
import { SyncStatusIndicator } from "@/components/sync/SyncStatusIndicator";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "INDI Ouro",
  description: "Gerencie o rebanho, pesos e vacinas da fazenda — mesmo offline.",
  manifest: "/manifest.json",
  themeColor: "#1162ae",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "INDI Ouro",
  },
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/logo.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/logo.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/logo.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="INDI Ouro" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/logo.svg"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DatabaseInitializer />
        <SyncStatusIndicator />
        {children}
        <ServiceWorkerUpdater />
        <SyncManager />
      </body>
    </html>
  );
}
