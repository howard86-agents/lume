/**
 * Lume service worker — offline app-shell cache.
 *
 * Goals (issue #59):
 *   - Pre-cache the visitor-flow HTML shells (/, /index, /scan) on
 *     install so an offline reload still loads the cover, gallery, and
 *     scanner.
 *   - Cache-first for immutable Next.js static assets so the app shell
 *     and fonts are served from disk on subsequent loads.
 *   - Network-first for HTML navigations so a new deploy lands as soon
 *     as the network is available.
 *   - Pick up new deploys cleanly: bumping the VERSION string
 *     invalidates every cache namespace from the previous deploy and
 *     skipWaiting + clients.claim activates the new worker without
 *     trapping visitors on a stale bundle.
 *
 * Persistence note: visitor progress lives in localStorage (see
 * apps/web/lib/lume-state.ts), which is not affected by this file. The
 * service worker only governs network/cache; the offline reload that
 * this issue calls for restores progress through that existing path.
 */

/* biome-ignore-start lint/style/noCommonJs: service worker target */
/* biome-ignore-start lint/style/useConst: SW globals */

// Bumped on every deploy that wants to invalidate the previous cache.
// Keep the suffix short so cache keys stay readable in DevTools.
const VERSION = "v1";
const SHELL_CACHE = `lume-shell-${VERSION}`;
const ASSET_CACHE = `lume-assets-${VERSION}`;

// HTML shells we want available offline. Each one is fetched during the
// install phase; failures are swallowed so a missing route never blocks
// the install (e.g. a deploy that has just removed /scan should not
// strand visitors on a stuck-installing service worker).
const SHELL_ROUTES = ["/", "/index", "/scan"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      await Promise.all(
        SHELL_ROUTES.map(async (url) => {
          try {
            const response = await fetch(url, { cache: "no-store" });
            if (response.ok) {
              await cache.put(url, response);
            }
          } catch {
            // Best-effort; missing routes are handled at fetch time.
          }
        })
      );
    })()
  );
  // Activate this version as soon as install finishes, so a returning
  // visitor on a new deploy is not trapped on the previous bundle.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Drop any cache namespace from a previous VERSION.
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== SHELL_CACHE && key !== ASSET_CACHE)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

/**
 * URL predicate: should this same-origin asset be runtime-cached?
 *
 * We cache Next's content-hashed bundles, the auto-generated app
 * icons, the manifest, fonts, and any /images/* asset. Anything else
 * (API routes, document HTML — handled separately) falls through to a
 * normal network fetch.
 */
function isCachableAsset(url) {
  if (url.pathname.startsWith("/_next/static/")) {
    return true;
  }
  if (url.pathname.startsWith("/icon")) {
    return true;
  }
  if (url.pathname.startsWith("/apple-icon")) {
    return true;
  }
  if (url.pathname === "/manifest.webmanifest") {
    return true;
  }
  if (url.pathname.startsWith("/images/")) {
    return true;
  }
  if (
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".woff") ||
    url.pathname.endsWith(".ttf")
  ) {
    return true;
  }
  return false;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") {
    return;
  }
  const url = new URL(request.url);
  // Cross-origin requests (e.g. Google Fonts, analytics) bypass the
  // worker entirely. We do not want to cache or modify them.
  if (url.origin !== self.location.origin) {
    return;
  }

  // Document navigations: network-first so deploys land immediately,
  // with a cached shell fallback when offline.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const network = await fetch(request);
          // Update the cached shell entry whenever the network supplies
          // a fresh document; this keeps the offline shell on the
          // latest layout/theme.
          const copy = network.clone();
          const cache = await caches.open(SHELL_CACHE);
          cache.put(request, copy).catch(() => {
            // Quota / opaque response — non-fatal.
          });
          return network;
        } catch {
          const cached = await caches.match(request);
          if (cached) {
            return cached;
          }
          const root = await caches.match("/");
          if (root) {
            return root;
          }
          return Response.error();
        }
      })()
    );
    return;
  }

  // Immutable / hashed static assets: cache-first.
  if (isCachableAsset(url)) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) {
          return cached;
        }
        try {
          const network = await fetch(request);
          if (network.ok) {
            const copy = network.clone();
            const cache = await caches.open(ASSET_CACHE);
            cache.put(request, copy).catch(() => {
              // Quota — non-fatal.
            });
          }
          return network;
        } catch {
          // Offline and not cached — return a synthetic 504 so the
          // caller can branch instead of hanging on a never-resolving
          // fetch.
          return new Response("", { status: 504, statusText: "Offline" });
        }
      })()
    );
  }
});

/* biome-ignore-end lint/style/noCommonJs: service worker target */
/* biome-ignore-end lint/style/useConst: SW globals */
