"use client";

import type { ReactNode } from "react";
import { LumeProvider } from "../components/lume-provider";
import { RoutePrefetcher } from "../components/route-prefetcher";
import { ServiceWorkerRegistration } from "../components/service-worker-registration";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LumeProvider>
      <ServiceWorkerRegistration />
      <RoutePrefetcher />
      {children}
    </LumeProvider>
  );
}
