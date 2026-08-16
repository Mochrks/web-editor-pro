
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from '@/components/AppProviders';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
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
    <html lang="en" className="dark h-full w-full overflow-hidden" suppressHydrationWarning>
      <body
        className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground h-full w-full overflow-hidden font-sans`}
        suppressHydrationWarning
      >
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
