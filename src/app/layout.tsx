import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { DirectionProvider } from "@/components/ui/direction";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import localFont from "next/font/local";
import { NextIntlClientProvider } from 'next-intl';
import { QueryProvider } from "@/providers/query-provider";


const iranyekan = localFont({
  src: "./fonts/IRANYekanXVF.woff2",
  display: "swap",
  variable: "--font-iranyekan",
  weight: "100 900",
})

export const metadata: Metadata = {
  title: "مارکینز",
  description: "نرم افزار حسابداری مالی طلا و جواهرات",
  icons: {
    icon: "/favicon.webp",
    shortcut: "/favicon.webp",
    apple: "/favicon.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={cn("h-full", "antialiased", iranyekan.variable)}
    >
      <body className="min-h-full flex flex-col ">
        <QueryProvider>
          <DirectionProvider direction="rtl" dir="rtl">
            <NextIntlClientProvider>
              <TooltipProvider>
                {children}
              </TooltipProvider>
              <Toaster />
            </NextIntlClientProvider>
          </DirectionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
