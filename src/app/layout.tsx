import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BCN Metro Live — Карта метро Барселоны",
  description: "Интерактивная карта метро и Rodalies Барселоны с предупреждениями о проверках билетов, задержках и отзывами пассажиров в реальном времени.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
