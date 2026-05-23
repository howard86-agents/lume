import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { fontVariables } from "./fonts";
import "./globals.css";
import { DeviceShell } from "../components/device-shell";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Lume",
  description:
    "A 23-specimen QR-scan light-form field guide across four floors.",
  // The manifest is generated from app/manifest.ts. Next.js's Metadata
  // API also auto-detects app/icon.* and app/apple-icon.tsx, so the
  // icon list is wired in without an explicit `icons` field here.
  applicationName: "Lume",
  appleWebApp: {
    // iOS Safari only honours the manifest's `display` once the page
    // also opts in via apple-mobile-web-app-capable. With this flag set,
    // launching Lume from the iOS Home Screen opens chrome-less (no
    // address bar, no toolbar) over the deep aurora background.
    capable: true,
    title: "Lume",
    // 'black-translucent' preserves the cover's dark canvas under the
    // status bar, matching themeColor and the manifest's
    // background_color.
    statusBarStyle: "black-translucent",
  },
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
        <DeviceShell>
          <Providers>{children}</Providers>
        </DeviceShell>
      </body>
    </html>
  );
}
