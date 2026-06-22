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
      <body>
        {children}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
            <script dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', { page_path: window.location.pathname });
              `,
            }} />
          </>
        )}
      </body>
    </html>
  );
}
