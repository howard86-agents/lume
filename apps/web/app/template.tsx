"use client";

import type { ReactNode } from "react";
import { consumeNavDirection } from "../lib/use-view-transition-router";

const directionClass: Record<string, string> = {
  forward: "animate-nav-in-right",
  back: "animate-nav-in-left",
  sheet: "animate-nav-in-up",
  "sheet-close": "animate-nav-in-up",
};

export default function Template({ children }: { children: ReactNode }) {
  const direction = consumeNavDirection();
  const cls = directionClass[direction] ?? "";
  // data-nav drives the forward-only [data-stagger] content cascade in globals.css.
  // h-full keeps the height chain intact: at >=768px --lu-screen-h flips to 100%,
  // so each page's main min-height:100% needs a definite-height parent to resolve
  // against. Without it the content collapses to its own height inside the frame.
  return (
    <div className={`h-full ${cls}`.trim()} data-nav={direction}>
      {children}
    </div>
  );
}
