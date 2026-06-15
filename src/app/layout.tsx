import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "../components/shared/ServiceWorkerRegister";
import { ThemeScript } from "../components/shared/ThemeScript";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#09090b",
};

export const metadata: Metadata = {
  title: "BCN Metro Live — Карта метро Барселоны",
  description: "Интерактивная карта метро и Rodalies Барселоны с предупреждениями о проверках билетов, задержках и отзывами пассажиров в реальном времени.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BCN Metro",
  },
  openGraph: {
    title: "BCN Metro Live — Live Barcelona Metro Map",
    description: "Interactive dark mode map of Barcelona Metro & Rodalies showing ticket inspections, train delays, and live comments in real-time.",
    url: "https://bcn-metro-live.vercel.app",
    siteName: "BCN Metro Live",
    images: [
      {
        url: "/og-banner.png",
        width: 1200,
        height: 630,
        alt: "BCN Metro Live Banner",
      },
    ],
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BCN Metro Live — Live Barcelona Metro Map",
    description: "Interactive dark mode map of Barcelona Metro & Rodalies showing ticket inspections, train delays, and live comments in real-time.",
    images: ["/og-banner.png"],
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
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
      className={`${geistSans.variable} ${geistMono.variable} h-[100dvh] antialiased`}
      suppressHydrationWarning
    >
      <head suppressHydrationWarning>
        {/* PWA iOS support */}
        <link rel="apple-touch-icon" href="/icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="BCN Metro" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        {/* Theme restore — blocking inline script runs before paint without React 19 warning */}
        <ThemeScript />
      </head>
      <body className="h-[100dvh] flex flex-col overflow-hidden" suppressHydrationWarning>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
