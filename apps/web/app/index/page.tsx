import { IndexPageClient } from "./index-page-client";

// Avoid Vercel's Next 16 static output collector bug for the literal `/index`
// route, where it looks for `index.segments/__PAGE__.segment.rsc` while Next
// writes `index.segments/index/__PAGE__.segment.rsc`.
export const dynamic = "force-dynamic";

export default function IndexPage() {
  return <IndexPageClient />;
}
