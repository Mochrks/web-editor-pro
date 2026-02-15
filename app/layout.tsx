
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from '@/components/AppProviders';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cortex Editor",
  description: "Advanced browser-based video editing software",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full w-full overflow-hidden">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground h-full w-full overflow-hidden font-sans`}
      >
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
