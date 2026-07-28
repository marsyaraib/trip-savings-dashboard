import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { SavingsDataProvider } from "@/hooks/useSavingsData";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "✈️ Overseas Trip Savings Dashboard",
  description: "Dashboard tabungan liburan bersama untuk Fafa, Febi, Nadine, dan Marsya.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <ThemeProvider>
          <SavingsDataProvider>
            <Navbar />
            <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 md:px-6 md:pb-12">{children}</main>
            <Toaster richColors position="top-center" />
          </SavingsDataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
