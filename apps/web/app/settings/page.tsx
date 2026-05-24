"use client";

import {
  LUME_LOCALE_LABELS,
  LUME_LOCALES,
  type LumeLocale,
} from "@lume/data/locales";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocale, useLume } from "../../components/lume-provider";
import { useViewTransitionRouter } from "../../lib/use-view-transition-router";

/**
 * Settings menu — `/settings`.
 *
 * Reachable from the index dock (and any other surface that wires it up
 * via a Link). Three responsibilities:
 *
 *   - language switching that updates the active locale live across
 *     every consumer of useLocale(),
 *   - 'reset progress' that clears the persisted state behind a
 *     confirmation dialog, and
 *   - the 'progress is kept on this device' recovery note the brief
 *     calls out so visitors understand why their state survives a
 *     refresh and what they're losing on reset.
 */

export default function SettingsPage() {
  const router = useRouter();
  const { navigate } = useViewTransitionRouter();
  const { reset } = useLume();
  const { lang, setLang, t } = useLocale();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const onResetConfirmed = () => {
    reset();
    setConfirmOpen(false);
    router.replace("/");
  };

  return (
    <main className="flex min-h-[var(--lu-screen-h)] flex-col gap-6 bg-aurora-page p-[max(40px,env(safe-area-inset-top))_20px_max(40px,env(safe-area-inset-bottom))] text-ink">
      <header className="flex items-center justify-between">
        <h1 className="m-0 font-semibold text-[24px] tracking-[-0.3px]">
          {t.settings_title}
        </h1>
        <button
          aria-label={t.settings_close}
          className="lu-press text-ink-2 text-sm"
          onClick={() => navigate("/collection", { mode: "sheet-close" })}
          type="button"
        >
          {t.settings_close}
        </button>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 font-mono-lu text-[11px] text-ink-2 uppercase tracking-[3px]">
          {t.settings_language}
        </h2>
        <fieldset className="m-0 flex flex-col gap-2 border-none p-0">
          <legend className="sr-only">{t.settings_language}</legend>
          {LUME_LOCALES.map((code) => {
            const labels = LUME_LOCALE_LABELS[code];
            const selected = lang === code;
            return (
              <label
                className={
                  selected
                    ? "lu-press flex w-full cursor-pointer appearance-none items-center justify-between rounded-[16px] border border-amber bg-amber/10 px-[18px] py-4 text-left text-base text-ink ring-1 ring-amber/35"
                    : "lu-press flex w-full cursor-pointer appearance-none items-center justify-between rounded-[16px] border border-rule-hair bg-glass-1 px-[18px] py-4 text-left text-base text-ink"
                }
                key={code}
              >
                <input
                  checked={selected}
                  className="sr-only"
                  name="lume-settings-language"
                  onChange={() => setLang(code as LumeLocale)}
                  type="radio"
                  value={code}
                />
                <span className="flex flex-col gap-[2px]">
                  <span className="font-semibold text-base">
                    {labels.native}
                  </span>
                  <span className="font-mono-lu text-[11px] text-ink-3 uppercase tracking-[2px]">
                    {labels.latin}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={
                    selected
                      ? "h-[14px] w-[14px] rounded-[50%] border border-amber bg-amber transition-[background-color,border-color] duration-[var(--lu-dur-fast)]"
                      : "h-[14px] w-[14px] rounded-[50%] border border-rule-strong bg-transparent transition-[background-color,border-color] duration-[var(--lu-dur-fast)]"
                  }
                />
              </label>
            );
          })}
        </fieldset>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 font-mono-lu text-[11px] text-ink-2 uppercase tracking-[3px]">
          {t.settings_reset}
        </h2>
        <button
          className="lu-press flex w-full cursor-pointer appearance-none items-center justify-between rounded-[16px] border border-rose/45 bg-rose/8 px-[18px] py-4 text-left font-semibold text-base text-rose"
          onClick={() => setConfirmOpen(true)}
          type="button"
        >
          <span>{t.settings_reset}</span>
          <span aria-hidden="true">→</span>
        </button>
        <p className="m-0 pl-1 text-[13px] text-ink-3 leading-[1.55]">
          {t.settings_progress_note}
        </p>
      </section>

      {confirmOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-deep/65 p-4 backdrop-blur-[8px]"
          role="dialog"
        >
          <div className="flex w-full max-w-[420px] flex-col gap-4 rounded-3xl border border-rule-strong bg-glass-3 px-6 pt-6 pb-5">
            <h2 className="m-0 font-semibold text-xl">
              {t.settings_reset_confirm_title}
            </h2>
            <p className="m-0 text-ink-2 text-sm leading-normal">
              {t.settings_reset_confirm_body}
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="lu-press cursor-pointer appearance-none border-none bg-transparent px-5 py-3 text-ink-2 text-sm"
                onClick={() => setConfirmOpen(false)}
                type="button"
              >
                {t.settings_reset_confirm_cancel}
              </button>
              <button
                className="lu-press cursor-pointer appearance-none rounded-full border border-rose bg-rose/16 px-5 py-3 font-semibold text-ink text-sm"
                onClick={onResetConfirmed}
                type="button"
              >
                {t.settings_reset_confirm_yes}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
