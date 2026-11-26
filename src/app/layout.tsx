import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DEFAULT_STORE_NAME } from "@/lib/constants"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: DEFAULT_STORE_NAME, template: `${DEFAULT_STORE_NAME} - %s` },
  description: "Sistem kasir dan pencatatan penjualan", // sesuaikan
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          {children}
        </TooltipProvider>
        <Toaster position="top-right" />
      </body>
    </html>

  );
}
