import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReceiptSplit - Split Bills Easily",
  description: "A fast, mobile-first app to split bills among friends. No login required.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="max-w-lg mx-auto px-4 py-6 pb-20">
          {children}
        </main>
      </body>
    </html>
  );
}
