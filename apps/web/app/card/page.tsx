"use client";

import { useRouter } from "next/navigation";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ACHIEVEMENT_CARD_HEIGHT,
  ACHIEVEMENT_CARD_WIDTH,
  AchievementCard,
} from "../../components/card/achievement-card";
import { useLocale, useLume } from "../../components/lume-provider";
import { saveAchievementCard } from "../../lib/save-card";

/**
 * Achievement card screen — `/card`.
 *
 * Renders a fixed-pixel `AchievementCard` (3 : 4 portrait) over the deep
 * aurora canvas. Explicit Share and Save buttons snapshot the card to PNG
 * via `modern-screenshot` after fonts are ready, then either open Web Share
 * (file payload, with download fallback) or download directly.
 *
 * Visitors who land here without 23/23 are redirected to `/collection` so
 * the card cannot be saved prematurely.
 *
 * The card is scaled down with CSS `transform: scale()` to fit narrow
 * viewports — modern-screenshot still captures the underlying pixel
 * dimensions, so the exported image is independent of the live preview
 * scale.
 */

/**
 * Maximum nickname length on the card. Long enough for any of the
 * five-language Visitor labels to spell out without clipping; short
 * enough that the achievement-card layout never wraps.
 */
const NICKNAME_MAX_LENGTH = 24;

/** Build the date the card renders — mono dotted `YYYY · MM · DD`. */
function formatCardDate(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()} · ${pad(now.getMonth() + 1)} · ${pad(now.getDate())}`;
}

export default function CardPage() {
  const router = useRouter();
  const { hydrated, completion, state, markCardSaved, setNickname } = useLume();
  const { t } = useLocale();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  // Send unfinished visitors back to the gallery so the card can never
  // be exported prematurely.
  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (!completion) {
      router.replace("/collection");
    }
  }, [hydrated, completion, router]);

  const dateLabel = useMemo(() => formatCardDate(), []);

  const nickname = state.nickname.trim() || t.card_visitor_default;

  const onNicknameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      // Keep the persisted nickname identical to what the visitor typed
      // (whitespace and all) — the trim only happens at the read-site so
      // we never destroy intentional in-name spaces.
      setNickname(event.target.value);
    },
    [setNickname]
  );

  const handleCardAction = useCallback(
    async (action: "share" | "download") => {
      const node = cardRef.current;
      if (!node || isSaving) {
        return;
      }
      setIsSaving(true);
      setErrorMessage(undefined);
      const outcome = await saveAchievementCard(node, { action });
      setIsSaving(false);
      if (outcome.kind === "share-cancelled") {
        // Visitor backed out of the share sheet — leave them on the card.
        return;
      }
      if (outcome.kind === "error") {
        setErrorMessage(outcome.reason);
        return;
      }
      markCardSaved();
      router.push("/saved");
    },
    [isSaving, markCardSaved, router]
  );

  // Defer rendering the card until provider hydration so the visitor
  // does not flash the localised "Visitor" fallback over their persisted
  // nickname.
  if (!hydrated) {
    return (
      <main className="relative flex min-h-[var(--lu-screen-h)] flex-col justify-between gap-6 bg-aurora-page px-5 pt-[max(40px,env(safe-area-inset-top))] pb-[max(40px,env(safe-area-inset-bottom))] text-ink" />
    );
  }

  return (
    <main className="relative flex min-h-[var(--lu-screen-h)] flex-col justify-between gap-6 bg-aurora-page px-5 pt-[max(40px,env(safe-area-inset-top))] pb-[max(40px,env(safe-area-inset-bottom))] text-ink">
      <header className="flex items-center justify-between">
        <h1 className="m-0 font-semibold text-[22px] tracking-[-0.3px]">
          {t.card_title}
        </h1>
        <button
          className="h-9 cursor-pointer appearance-none rounded-full border border-rule-hair bg-glass-1 px-[14px] text-[13px] text-ink-2"
          onClick={() => router.push("/collection")}
          type="button"
        >
          {t.card_saved_back}
        </button>
      </header>

      <section className="flex flex-1 items-center justify-center">
        <CardStage>
          <AchievementCard
            cardTitle={t.card_title}
            dateLabel={dateLabel}
            fieldGuideLabel={t.card_field_guide}
            nickname={nickname}
            ref={cardRef}
          />
        </CardStage>
      </section>

      <div className="mx-auto flex w-[min(360px,100%)] flex-col items-center gap-[6px]">
        <label
          className="font-mono-lu text-[10px] text-ink-2 uppercase tracking-[3px]"
          htmlFor="lume-card-nickname"
        >
          {t.card_nickname_label}
        </label>
        <input
          autoCapitalize="words"
          autoComplete="off"
          className="h-11 w-full appearance-none rounded-full border border-rule-hair bg-glass-1 px-4 text-center font-medium text-base text-ink"
          id="lume-card-nickname"
          maxLength={NICKNAME_MAX_LENGTH}
          onChange={onNicknameChange}
          placeholder={t.card_nickname_placeholder}
          spellCheck={false}
          style={{ fontFamily: "var(--lu-font-display)" }}
          type="text"
          value={state.nickname}
        />
      </div>

      <footer className="flex flex-col items-center gap-3">
        <div className="flex w-[min(360px,100%)] justify-center gap-3">
          <button
            aria-busy={isSaving}
            className="min-w-0 flex-1 cursor-pointer appearance-none rounded-full border border-mint bg-[rgba(126,240,196,0.16)] px-6 py-4 font-semibold text-base text-ink tracking-[0.4px] shadow-[0_0_0_1px_rgba(126,240,196,0.35)] disabled:cursor-wait disabled:opacity-[0.65]"
            disabled={isSaving}
            onClick={() => handleCardAction("share")}
            type="button"
          >
            {isSaving ? t.card_saving : t.card_share}
          </button>
          <button
            aria-busy={isSaving}
            className="min-w-0 flex-1 cursor-pointer appearance-none rounded-full border border-mint bg-[rgba(126,240,196,0.16)] px-6 py-4 font-semibold text-base text-ink tracking-[0.4px] shadow-[0_0_0_1px_rgba(126,240,196,0.35)] disabled:cursor-wait disabled:opacity-[0.65]"
            disabled={isSaving}
            onClick={() => handleCardAction("download")}
            type="button"
          >
            {isSaving ? t.card_saving : t.card_save}
          </button>
        </div>
        <span
          aria-live="polite"
          className={`min-h-[18px] font-mono-lu text-[11px] uppercase tracking-[1.5px] ${errorMessage ? "text-rose normal-case tracking-[0.5px]" : "text-ink-2"}`}
          role="status"
        >
          {errorMessage ?? ""}
        </span>
      </footer>
    </main>
  );
}

/**
 * CSS-only stage that scales the fixed-pixel achievement card down to fit
 * narrow viewports. We keep the base size at the export dimensions so the
 * snapshot is deterministic regardless of the visible scale on screen.
 */
function CardStage({ children }: { children: React.ReactNode }) {
  // 24px gutter + safe area on a typical 360px-wide phone leaves us
  // ~312px to play with. Scaling down to 0.86 fits with margin.
  const stageStyle = useMemo<CSSProperties>(
    () => ({
      width: ACHIEVEMENT_CARD_WIDTH,
      height: ACHIEVEMENT_CARD_HEIGHT,
      transform: "scale(min(1, calc((100vw - 48px) / var(--lu-card-width))))",
      transformOrigin: "center",
      // The CSS variable lets us reuse the constant without inlining a
      // duplicate magic number.
      ["--lu-card-width" as string]: `${ACHIEVEMENT_CARD_WIDTH}px`,
    }),
    []
  );
  return <div style={stageStyle}>{children}</div>;
}
