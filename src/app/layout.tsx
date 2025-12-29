import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "ReceiptSplit",
  description: "Partagez vos additions facilement. Split bills easily with friends.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f2f2f7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen">
        <Providers>
          <main className="max-w-lg mx-auto px-4 py-6 pb-24">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
