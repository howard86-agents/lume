"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLocale, useLume } from "../../components/lume-provider";
import { useViewTransitionRouter } from "../../lib/use-view-transition-router";

/**
 * Achievement-card save confirmation — `/saved`.
 *
 * Visitors land here after `saveAchievementCard` resolves successfully on
 * `/card`. The screen confirms the save (mirroring the brief's "card
 * saved" moment) and offers a single primary action back to the index.
 *
 * Routing guards: visitors who reach this URL without `cardSaved` set
 * are redirected back to `/card` (or `/collection` if they have not yet
 * reached 23/23) so the confirmation cannot be surfaced out of order.
 */

export default function SavedPage() {
  const router = useRouter();
  const { navigate } = useViewTransitionRouter();
  const { hydrated, completion, state } = useLume();
  const { t } = useLocale();

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (!completion) {
      router.replace("/collection");
      return;
    }
    if (!state.cardSaved) {
      router.replace("/card");
    }
  }, [hydrated, completion, state.cardSaved, router]);

  return (
    <main className="relative flex min-h-[var(--lu-screen-h)] flex-col justify-between bg-aurora-cover px-6 pt-[max(48px,env(safe-area-inset-top))] pb-[max(40px,env(safe-area-inset-bottom))] text-ink">
      <header className="flex flex-col items-center gap-2 text-center">
        <span className="font-mono-lu text-[11px] text-mint uppercase tracking-[3px]">
          {t.card_saved_eyebrow}
        </span>
      </header>

      <section
        className="relative flex w-[min(72vw,280px)] items-center justify-center self-center"
        style={{ aspectRatio: "1 / 1" }}
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-[50%] bg-aurora-halo opacity-[0.7] blur-[28px]"
        />
        <span className="relative flex h-24 w-24 items-center justify-center rounded-[50%] border border-mint bg-[rgba(126,240,196,0.12)] shadow-[0_0_32px_rgba(126,240,196,0.35)]">
          <svg
            aria-hidden="true"
            fill="none"
            focusable="false"
            height="36"
            stroke="var(--lu-accent-mint)"
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

      <section className="flex flex-col items-center gap-3 text-center">
        <h1 className="m-0 max-w-[360px] font-semibold text-[28px] tracking-[-0.4px]">
          {t.card_saved_title}
        </h1>
        <p className="m-0 max-w-[360px] text-[15px] text-ink-2 leading-normal">
          {t.card_saved_body}
        </p>
      </section>

      <footer className="flex flex-col items-center gap-3">
        <button
          className="w-[min(320px,100%)] cursor-pointer appearance-none rounded-full border border-rule-strong bg-glass-3 px-6 py-4 font-semibold text-base text-ink tracking-[0.4px]"
          onClick={() => navigate("/collection", { mode: "sheet-close" })}
          type="button"
        >
          {t.card_saved_back}
        </button>
      </footer>
    </main>
  );
}
