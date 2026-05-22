"use client";

import { useEffect } from "react";

/**
 * Register the Lume service worker — `apps/web/public/sw.js`.
 *
 * Renders nothing; lives inside the providers tree so the registration
 * runs once per page load. Guards keep the worker off in environments
 * where it would either misbehave or actively harm the developer
 * experience:
 *
 *   - bail out on the server (`window` is undefined),
 *   - bail out when the browser does not expose `serviceWorker`,
 *   - bail out outside a secure context (the SW spec rejects `http://`
 *     except on `localhost`, but `isSecureContext` is the canonical
 *     check),
 *   - bail out outside production builds — registering in dev would
 *     trap visitors on stale bundles when Next's HMR updates a file
 *     that the SW has already cached.
 *
 * On registration failure we surface a console warning rather than
 * throwing; failing to install the SW must never break the visitor
 * flow.
 */
export function ServiceWorkerRegistration(): null {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (!("serviceWorker" in navigator)) {
      return;
    }
    if (!window.isSecureContext) {
      return;
    }
    if (process.env.NODE_ENV !== "production") {
      return;
    }
    navigator.serviceWorker.register("/sw.js").catch((error: unknown) => {
      // eslint-disable-next-line no-console -- intentional warning channel
      console.warn("Lume service worker failed to register", error);
    });
  }, []);
  return null;
}
