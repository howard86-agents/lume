"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const STATIC_ROUTES = [
  "/",
  "/onboarding",
  "/permission",
  "/language",
  "/scan",
  "/collection",
  "/saved",
  "/settings",
  "/card",
  "/complete",
];

export function RoutePrefetcher() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const prefetch = () => {
      for (const route of STATIC_ROUTES) {
        router.prefetch(route);
      }
    };

    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(prefetch);
      return () => window.cancelIdleCallback(id);
    }

    const id = setTimeout(prefetch, 200);
    return () => clearTimeout(id);
  }, [router]);

  return null;
}
