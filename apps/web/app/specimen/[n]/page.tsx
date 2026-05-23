"use client";

import {
  getSpecimenByNumber,
  getSpecimenVisual,
  LUME_TOTAL_SPECIMENS,
  type LumeSpecimen,
} from "@lume/data/specimens";
import { LU } from "@lume/data/tokens";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use, useEffect } from "react";
import { useLocale, useLume } from "../../../components/lume-provider";
import { LumeSpecimen as LumeSpecimenView } from "../../../components/specimen/lume-specimen";

/**
 * Specimen detail plate — `/specimen/[n]`.
 *
 * Renders the localized field-guide entry for one collected specimen:
 * plate/floor/NO. metadata in the chrome, the big LumeSpecimen glyph in
 * a glass plate, the editorial localized name with a mono Latin subtitle,
 * the localized field notes, and the
 * timestamp from `collectedAt`. Back links to `/collection`.
 *
 * Locked specimens (i.e. ones the visitor has not yet collected) are
 * redirected back to `/collection` so the route never accidentally reveals
 * what's still to find.
 */

interface SpecimenDetailProps {
  /** Next 16 passes async route params; `use()` unwraps them in a client component. */
  params: Promise<{ n: string }>;
}

function formatCollectedAt(
  iso: string | undefined,
  lang: string,
  template: string
): string | undefined {
  if (!iso) {
    return;
  }
  let display = iso;
  try {
    display = new Intl.DateTimeFormat(lang === "en" ? "en-GB" : lang, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    // Fallback: show ISO date when the locale string isn't recognised.
  }
  return template.replace("{date}", display);
}

function PlateBackdrop({ specimen }: { specimen: LumeSpecimen }) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 28,
        opacity: 0.55,
        background:
          "radial-gradient(60% 50% at 50% 50%, rgba(246,246,251,0.06) 0%, rgba(246,246,251,0) 70%)",
        pointerEvents: "none",
      }}
    >
      <span
        data-hue={specimen.hue}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 28,
          background: LU.aurora.halo,
          filter: "blur(40px)",
          opacity: 0.18,
          mixBlendMode: "screen",
        }}
      />
    </span>
  );
}

export default function SpecimenDetailPage({ params }: SpecimenDetailProps) {
  const { n } = use(params);
  const router = useRouter();
  const { hydrated, collectedNumbers, state } = useLume();
  const { lang, t } = useLocale();

  const parsed = Number.parseInt(n, 10);
  const specimen = getSpecimenByNumber(parsed);

  useEffect(() => {
    // After hydration, redirect away from a specimen the visitor has not
    // yet collected. Pre-hydration we render the plate optimistically;
    // there is no IDOR risk because the data is purely localized text.
    if (!(hydrated && specimen)) {
      return;
    }
    if (!collectedNumbers.has(specimen.number)) {
      router.replace("/collection");
    }
  }, [hydrated, specimen, collectedNumbers, router]);

  if (!specimen) {
    notFound();
  }

  const localizedName = specimen.name[lang];
  const localizedNotes = specimen.notes[lang];
  const visual = getSpecimenVisual(specimen, lang);
  const specimenNumber = String(specimen.number).padStart(3, "0");

  const collectedAtText = formatCollectedAt(
    state.collectedAt[specimen.number],
    lang,
    t.specimen_collected_at
  );

  return (
    <main className="flex min-h-[var(--lu-screen-h)] flex-col gap-5 bg-aurora-page p-[max(40px,env(safe-area-inset-top))_20px_max(40px,env(safe-area-inset-bottom))] text-ink">
      <header className="flex items-center justify-between">
        <Link
          className="inline-flex cursor-pointer items-center gap-2 text-ink-2 text-sm no-underline"
          href="/collection"
        >
          <span aria-hidden="true">←</span>
          <span>{t.specimen_back}</span>
        </Link>
        <span className="flex items-baseline gap-3 font-mono-lu text-[11px] text-ink-3 uppercase tracking-[2px]">
          {String(specimen.number).padStart(2, "0")} / {LUME_TOTAL_SPECIMENS}
        </span>
      </header>

      <section className="relative flex aspect-[5/6] w-[min(360px,90%)] items-center justify-center self-center overflow-hidden rounded-[28px] border border-rule-hair bg-glass-1">
        <PlateBackdrop specimen={specimen} />
        <span className="absolute top-[18px] left-5 z-[2] font-mono-lu text-[10px] text-ink-3 uppercase leading-[1.2] tracking-[1.6px] [text-shadow:0_0_12px_rgba(246,246,251,0.18)]">
          {t.specimen_plate_label} · {specimen.plate}
        </span>
        <span className="absolute top-[18px] right-5 z-[2] text-right font-mono-lu text-[10px] text-ink-3 uppercase leading-[1.2] tracking-[1.6px] [text-shadow:0_0_12px_rgba(246,246,251,0.18)]">
          {t.specimen_floor_label} · {specimen.floor}
        </span>
        <span className="absolute bottom-[18px] left-5 z-[2] font-mono-lu text-[10px] text-ink-3 uppercase leading-[1.2] tracking-[1.6px] [text-shadow:0_0_12px_rgba(246,246,251,0.18)]">
          {t.specimen_number_label} {specimenNumber}
        </span>
        <span className="absolute right-5 bottom-[18px] z-[2] text-right font-mono-lu text-[10px] text-ink-3 uppercase leading-[1.2] tracking-[1.6px] [text-shadow:0_0_12px_rgba(246,246,251,0.18)]">
          {t.specimen_specimen_label}
        </span>
        <div className="relative">
          <LumeSpecimenView
            form={specimen.form}
            glow={0.7}
            hue={specimen.hue}
            image={visual.kind === "image" ? visual : undefined}
            size={224}
          />
        </div>
      </section>

      <section className="flex w-[min(460px,100%)] flex-col items-start gap-1 self-center text-left">
        <h1 className="m-0 font-semibold text-[clamp(32px,8vw,36px)] leading-[1.03] tracking-[-0.8px]">
          {localizedName}
        </h1>
        <span className="font-mono-lu text-ink-3 text-xs uppercase tracking-[2px]">
          {specimen.name.en}
        </span>
      </section>

      <span className="mt-2 w-[min(460px,100%)] self-center font-mono-lu text-[11px] text-ink-3 uppercase tracking-[2.4px]">
        {t.specimen_field_notes}
      </span>
      <p className="m-0 max-w-[460px] self-center text-left text-[15px] text-ink-2 leading-[1.55]">
        {localizedNotes}
      </p>

      {collectedAtText ? (
        <p className="m-0 w-[min(460px,100%)] self-center text-left font-mono-lu text-[11px] text-ink-3 uppercase tracking-[1.5px]">
          {collectedAtText}
        </p>
      ) : null}
    </main>
  );
}
