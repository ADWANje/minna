import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE, SITE_URL } from "@/lib/config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE.name} — ${SITE.question}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  openGraph: {
    type: "website",
    locale: "ar",
    siteName: `${SITE.name} — ${SITE.brand}`,
    title: `${SITE.name} — ${SITE.question}`,
    description: SITE.description,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#141412",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600&display=swap"
        />
      </head>
      <body className="bg-bone text-ink antialiased">{children}</body>
    </html>
  );
}
