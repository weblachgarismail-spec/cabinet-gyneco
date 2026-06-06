import { ReactNode } from "react";
import type { Viewport, Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cabinet Gynécologique El Jadida",
  description: "Cabinet Gynécologique El Jadida - Soins gynécologiques de qualité",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
