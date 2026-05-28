"use client";

import { ReactNode } from "react";
import SessionProviderWrapper from "./SessionProviderWrapper";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { ThemeProvider } from "./ThemeProvider";
import { LocaleProvider } from "./LocaleProvider";
import CookieConsent from "./CookieConsent";
import SupportBot from "./SupportBot";

import { usePathname } from "next/navigation";

export default function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <LocaleProvider>
      <ThemeProvider>
        <SessionProviderWrapper>
          <Navbar />
          <main className={`min-h-[80vh] ${isHome ? "" : "pt-16"}`}>{children}</main>
          <Footer />
          <CookieConsent />
          <SupportBot />
        </SessionProviderWrapper>
      </ThemeProvider>
    </LocaleProvider>
  );
}
