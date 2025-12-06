import { Outfit } from "next/font/google";
import "./globals.css";

import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import StoreProvider from "@/providers/StoreProvider";
import TranslationProvider from "@/providers/TranslationProvider";

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.className} dark:bg-gray-900`} suppressHydrationWarning>
        <StoreProvider>
          <ThemeProvider>
            <TranslationProvider>
            <SidebarProvider>{children}</SidebarProvider>
            </TranslationProvider>
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
