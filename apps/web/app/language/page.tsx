"use client";

import {
  LUME_LOCALE_LABELS,
  LUME_LOCALES,
  type LumeLocale,
} from "@lume/data/locales";
import { useLocale } from "../../components/lume-provider";
import { useViewTransitionRouter } from "../../lib/use-view-transition-router";

/**
 * Language picker — `/language`.
 *
 * Lists the five supported locales as glassy selectable rows with the
 * active one highlighted in amber. Selection persists via the provider
 * immediately (so the screen updates live), and Continue advances to
 * the onboarding primer.
 */

export default function LanguagePage() {
  const { navigate } = useViewTransitionRouter();
  const { lang, setLang, t } = useLocale();
  const proceed = () => navigate("/onboarding");
  return (
    <main className="flex min-h-[var(--lu-screen-h)] flex-col gap-6 bg-aurora-page px-6 pt-[max(48px,env(safe-area-inset-top))] pb-[max(40px,env(safe-area-inset-bottom))] text-ink">
      <header
        className="flex flex-col gap-2"
        data-stagger
        style={{ "--i": 0 } as React.CSSProperties}
      >
        <span className="font-mono-lu text-[11px] text-ink-3 uppercase tracking-[3px]">
          {t.language_step}
        </span>
        <h1 className="m-0 font-semibold text-[28px] tracking-[-0.4px]">
          {t.language_title}
        </h1>
        <p className="m-0 text-[15px] text-ink-2 leading-[1.45]">
          {t.language_subtitle}
        </p>
      </header>

      <fieldset
        className="min-inline-size-auto m-0 mt-2 flex flex-col gap-3 border-none p-0"
        data-stagger
        style={{ "--i": 1 } as React.CSSProperties}
      >
        <legend className="sr-only">{t.language_title}</legend>
        {LUME_LOCALES.map((code) => {
          const labels = LUME_LOCALE_LABELS[code];
          const selected = lang === code;
          return (
            <label
              className={
                selected
                  ? "lu-press flex w-full cursor-pointer appearance-none items-center justify-between rounded-[18px] border border-amber bg-amber/10 px-5 py-[18px] text-left text-base text-ink ring-1 ring-amber/35"
                  : "lu-press flex w-full cursor-pointer appearance-none items-center justify-between rounded-[18px] border border-rule-hair bg-glass-1 px-5 py-[18px] text-left text-base text-ink"
              }
              key={code}
            >
              <input
                checked={selected}
                className="sr-only"
                name="lume-language"
                onChange={() => setLang(code as LumeLocale)}
                type="radio"
                value={code}
              />
              <span className="flex flex-col gap-[2px]">
                <span className="font-semibold text-[17px]">
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
                    ? "flex h-[18px] w-[18px] items-center justify-center rounded-full border border-amber shadow-[0_0_12px_rgba(255,183,85,0.65)] transition-[border-color,box-shadow] duration-[var(--lu-dur-fast)]"
                    : "flex h-[18px] w-[18px] items-center justify-center rounded-full border border-rule-strong transition-[border-color,box-shadow] duration-[var(--lu-dur-fast)]"
                }
              >
                <span
                  className={
                    selected
                      ? "h-1.5 w-1.5 rounded-full bg-amber shadow-[0_0_8px_rgba(255,183,85,0.75)] transition-[background-color,opacity,box-shadow] duration-[var(--lu-dur-fast)]"
                      : "h-1.5 w-1.5 rounded-full bg-amber opacity-0 transition-[background-color,opacity,box-shadow] duration-[var(--lu-dur-fast)]"
                  }
                />
              </span>
            </label>
          );
        })}
      </fieldset>

      <footer
        className="mt-auto flex flex-col gap-3"
        data-stagger
        style={{ "--i": 2 } as React.CSSProperties}
      >
        <button
          className="lu-press w-full cursor-pointer appearance-none rounded-full border border-rule-strong bg-glass-3 px-6 py-4 font-semibold text-base text-ink tracking-[0.4px]"
          onClick={proceed}
          type="button"
        >
          {t.language_continue}
        </button>
        <button
          className="lu-press cursor-pointer appearance-none self-center border-none bg-transparent p-2 text-ink-2 text-sm"
          onClick={proceed}
          type="button"
        >
          {t.language_skip}
        </button>
      </footer>
    </main>
  );
}
