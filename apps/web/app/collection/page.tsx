import { IndexPageClient } from "./index-page-client";

// This gallery lives at `/collection`, not `/index`: on Vercel the literal
// `/index` segment collapses onto `/` (the request reports `x-matched-path: /`
// and serves the prerendered cover), so the route was renamed off the reserved
// name. The page renders per-visitor client state, so opt out of prerendering.
export const dynamic = "force-dynamic";

export default function IndexPage() {
  return <IndexPageClient />;
}
