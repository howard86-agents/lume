"use client";

import { LU } from "@lume/data/tokens";
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

const PAGE_STYLE: CSSProperties = {
  position: "relative",
  minHeight: "var(--lu-screen-h)",
  background: LU.aurora.page,
  color: LU.base.ink,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  padding:
    "max(40px, env(safe-area-inset-top)) 20px max(40px, env(safe-area-inset-bottom))",
  gap: 24,
};

const HEADER_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const TITLE_STYLE: CSSProperties = {
  fontSize: 22,
  fontWeight: 600,
  letterSpacing: -0.3,
  margin: 0,
};

const BACK_STYLE: CSSProperties = {
  appearance: "none",
  border: `1px solid ${LU.rule.hair}`,
  background: LU.glass.surface1,
  color: LU.base.ink2,
  height: 36,
  padding: "0 14px",
  borderRadius: 999,
  fontSize: 13,
  cursor: "pointer",
};

const STAGE_STYLE: CSSProperties = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const FOOTER_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
};

const ACTIONS_STYLE: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  gap: 12,
  width: "min(360px, 100%)",
};

const PRIMARY_BUTTON_STYLE: CSSProperties = {
  appearance: "none",
  border: `1px solid ${LU.accent.mint}`,
  background: "rgba(126, 240, 196, 0.16)",
  color: LU.base.ink,
  padding: "16px 24px",
  borderRadius: 999,
  fontSize: 16,
  fontWeight: 600,
  letterSpacing: 0.4,
  cursor: "pointer",
  flex: 1,
  minWidth: 0,
  boxShadow: "0 0 0 1px rgba(126, 240, 196, 0.35)",
};

const PRIMARY_BUTTON_DISABLED_STYLE: CSSProperties = {
  ...PRIMARY_BUTTON_STYLE,
  opacity: 0.65,
  cursor: "wait",
};

const STATUS_STYLE: CSSProperties = {
  minHeight: 18,
  fontFamily: "var(--lu-font-mono)",
  fontSize: 11,
  letterSpacing: 1.5,
  textTransform: "uppercase",
  color: LU.base.ink2,
};

const STATUS_ERROR_STYLE: CSSProperties = {
  ...STATUS_STYLE,
  color: LU.accent.rose,
  textTransform: "none",
  letterSpacing: 0.5,
};

const NICKNAME_FIELD_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 6,
  width: "min(360px, 100%)",
  margin: "0 auto",
};

const NICKNAME_LABEL_STYLE: CSSProperties = {
  fontFamily: "var(--lu-font-mono)",
  fontSize: 10,
  letterSpacing: 3,
  textTransform: "uppercase",
  color: LU.base.ink2,
};

const NICKNAME_INPUT_STYLE: CSSProperties = {
  appearance: "none",
  width: "100%",
  height: 44,
  padding: "0 16px",
  borderRadius: 999,
  border: `1px solid ${LU.rule.hair}`,
  background: LU.glass.surface1,
  color: LU.base.ink,
  fontSize: 16,
  fontWeight: 500,
  textAlign: "center",
  fontFamily: "var(--lu-font-display)",
  // iOS Safari font-size < 16px triggers the auto-zoom-on-focus
  // behaviour; keep the field at 16 so the page stays put.
};

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
    return <main style={PAGE_STYLE} />;
  }

  return (
    <main style={PAGE_STYLE}>
      <header style={HEADER_STYLE}>
        <h1 style={TITLE_STYLE}>{t.card_title}</h1>
        <button
          onClick={() => router.push("/collection")}
          style={BACK_STYLE}
          type="button"
        >
          {t.card_saved_back}
        </button>
      </header>

      <section style={STAGE_STYLE}>
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

      <div style={NICKNAME_FIELD_STYLE}>
        <label htmlFor="lume-card-nickname" style={NICKNAME_LABEL_STYLE}>
          {t.card_nickname_label}
        </label>
        <input
          autoCapitalize="words"
          autoComplete="off"
          id="lume-card-nickname"
          maxLength={NICKNAME_MAX_LENGTH}
          onChange={onNicknameChange}
          placeholder={t.card_nickname_placeholder}
          spellCheck={false}
          style={NICKNAME_INPUT_STYLE}
          type="text"
          value={state.nickname}
        />
      </div>

      <footer style={FOOTER_STYLE}>
        <div style={ACTIONS_STYLE}>
          <button
            aria-busy={isSaving}
            disabled={isSaving}
            onClick={() => handleCardAction("share")}
            style={
              isSaving ? PRIMARY_BUTTON_DISABLED_STYLE : PRIMARY_BUTTON_STYLE
            }
            type="button"
          >
            {isSaving ? t.card_saving : t.card_share}
          </button>
          <button
            aria-busy={isSaving}
            disabled={isSaving}
            onClick={() => handleCardAction("download")}
            style={
              isSaving ? PRIMARY_BUTTON_DISABLED_STYLE : PRIMARY_BUTTON_STYLE
            }
            type="button"
          >
            {isSaving ? t.card_saving : t.card_save}
          </button>
        </div>
        <span
          aria-live="polite"
          role="status"
          style={errorMessage ? STATUS_ERROR_STYLE : STATUS_STYLE}
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
