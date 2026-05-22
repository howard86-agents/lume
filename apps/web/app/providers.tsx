"use client";

import type { ReactNode } from "react";
import { LumeProvider } from "../components/lume-provider";
import { ServiceWorkerRegistration } from "../components/service-worker-registration";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LumeProvider>
      <ServiceWorkerRegistration />
      {children}
    </LumeProvider>
  );
}
