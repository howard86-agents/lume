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
  return (
    <div className={cls} data-nav={direction}>
      {children}
    </div>
  );
}
