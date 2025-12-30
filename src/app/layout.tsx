import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { AnimatedBackground } from "@/components/AnimatedBackground";

export const metadata: Metadata = {
  title: "ReceiptSplit",
  description: "Partagez vos additions facilement. Split bills easily with friends.",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f8f4e8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen">
        <AnimatedBackground />
        <Providers>
          <main className="max-w-lg mx-auto px-4 py-6 pb-24 relative z-10">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
