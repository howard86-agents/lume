import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { fontVariables } from "./fonts";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Lume",
  description:
    "A 23-specimen QR-scan light-form field guide across four floors.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0a0a0f",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html className={fontVariables} lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
