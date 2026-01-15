import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { AnimatedBackground } from "@/components/AnimatedBackground";

export const metadata: Metadata = {
  title: "ReceiptSplit",
  description: "Partagez vos additions facilement. Split bills easily with friends.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/api/icon?size=192", sizes: "192x192", type: "image/png" },
      { url: "/api/icon?size=512", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/api/icon?size=152", sizes: "152x152", type: "image/png" },
      { url: "/api/icon?size=180", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ReceiptSplit",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1a" },
  ],
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* PWA Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('SW registered: ', registration);
                  }).catch(function(error) {
                    console.log('SW registration failed: ', error);
                  });
                });
              }
            `,
          }}
        />
        {/* iOS splash screens */}
        <link rel="apple-touch-startup-image" href="/api/icon?size=512" />
      </head>
      <body className="min-h-screen antialiased">
        <AnimatedBackground />
        <Providers>
          <main className="relative z-10">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
