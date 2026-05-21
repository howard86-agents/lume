"use client";

import type { ReactNode } from "react";
import { LumeProvider } from "../components/lume-provider";

export function Providers({ children }: { children: ReactNode }) {
  return <LumeProvider>{children}</LumeProvider>;
}
