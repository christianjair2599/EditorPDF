"use client";

import { ReactNode } from "react";
import SessionProviderWrapper from "./SessionProviderWrapper";
import Navbar from "./Navbar";
import { ThemeProvider } from "./ThemeProvider";
import { LocaleProvider } from "./LocaleProvider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <ThemeProvider>
        <SessionProviderWrapper>
          <Navbar />
          <main>{children}</main>
        </SessionProviderWrapper>
      </ThemeProvider>
    </LocaleProvider>
  );
}
