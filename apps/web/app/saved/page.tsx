"use client";

import { LU } from "@lume/data/tokens";
import { useRouter } from "next/navigation";
import { type CSSProperties, useEffect } from "react";
import { useLocale, useLume } from "../../components/lume-provider";

/**
 * Achievement-card save confirmation — `/saved`.
 *
 * Visitors land here after `saveAchievementCard` resolves successfully on
 * `/card`. The screen confirms the save (mirroring the brief's "card
 * saved" moment) and offers a single primary action back to the index.
 *
 * Routing guards: visitors who reach this URL without `cardSaved` set
 * are redirected back to `/card` (or `/index` if they have not yet
 * reached 23/23) so the confirmation cannot be surfaced out of order.
 */

const PAGE_STYLE: CSSProperties = {
  position: "relative",
  minHeight: "100dvh",
  background: LU.aurora.cover,
  color: LU.base.ink,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  padding:
    "max(48px, env(safe-area-inset-top)) 24px max(40px, env(safe-area-inset-bottom))",
};

const HEADER_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
  textAlign: "center",
};

const EYEBROW_STYLE: CSSProperties = {
  fontFamily: "var(--lu-font-mono)",
  fontSize: 11,
  letterSpacing: 3,
  textTransform: "uppercase",
  color: LU.accent.mint,
};

const HERO_STYLE: CSSProperties = {
  position: "relative",
  alignSelf: "center",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "min(72vw, 280px)",
  aspectRatio: "1 / 1",
};

const HALO_STYLE: CSSProperties = {
  position: "absolute",
  inset: 0,
  borderRadius: "50%",
  background: LU.aurora.halo,
  filter: "blur(28px)",
  opacity: 0.7,
};

const ICON_STYLE: CSSProperties = {
  position: "relative",
  width: 96,
  height: 96,
  borderRadius: "50%",
  border: `1px solid ${LU.accent.mint}`,
  background: "rgba(126, 240, 196, 0.12)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 0 32px rgba(126, 240, 196, 0.35)",
};

const COPY_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
  textAlign: "center",
};

const TITLE_STYLE: CSSProperties = {
  fontSize: 28,
  fontWeight: 600,
  letterSpacing: -0.4,
  margin: 0,
  maxWidth: 360,
};

const BODY_STYLE: CSSProperties = {
  color: LU.base.ink2,
  fontSize: 15,
  lineHeight: 1.5,
  margin: 0,
  maxWidth: 360,
};

const FOOTER_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
};

const PRIMARY_BUTTON_STYLE: CSSProperties = {
  appearance: "none",
  border: `1px solid ${LU.rule.strong}`,
  background: LU.glass.surface3,
  color: LU.base.ink,
  padding: "16px 24px",
  borderRadius: 999,
  fontSize: 16,
  fontWeight: 600,
  letterSpacing: 0.4,
  cursor: "pointer",
  width: "min(320px, 100%)",
};

export default function SavedPage() {
  const router = useRouter();
  const { hydrated, completion, state } = useLume();
  const { t } = useLocale();

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (!completion) {
      router.replace("/index");
      return;
    }
    if (!state.cardSaved) {
      router.replace("/card");
    }
  }, [hydrated, completion, state.cardSaved, router]);

  return (
    <main style={PAGE_STYLE}>
      <header style={HEADER_STYLE}>
        <span style={EYEBROW_STYLE}>{t.card_saved_eyebrow}</span>
      </header>

      <section style={HERO_STYLE}>
        <span aria-hidden="true" style={HALO_STYLE} />
        <span style={ICON_STYLE}>
          <svg
            aria-hidden="true"
            fill="none"
            focusable="false"
            height="36"
            stroke={LU.accent.mint}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="36"
          >
            <title>{t.card_saved_eyebrow}</title>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      </section>

      <section style={COPY_STYLE}>
        <h1 style={TITLE_STYLE}>{t.card_saved_title}</h1>
        <p style={BODY_STYLE}>{t.card_saved_body}</p>
      </section>

      <footer style={FOOTER_STYLE}>
        <button
          onClick={() => router.push("/index")}
          style={PRIMARY_BUTTON_STYLE}
          type="button"
        >
          {t.card_saved_back}
        </button>
      </footer>
    </main>
  );
}
