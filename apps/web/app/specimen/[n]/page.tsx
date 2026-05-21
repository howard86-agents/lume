"use client";

import { getSpecimenByNumber, type LumeSpecimen } from "@lume/data/specimens";
import { LU } from "@lume/data/tokens";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { type CSSProperties, use, useEffect } from "react";
import { useLocale, useLume } from "../../../components/lume-provider";
import { LumeSpecimen as LumeSpecimenView } from "../../../components/specimen/lume-specimen";

/**
 * Specimen detail plate — `/specimen/[n]`.
 *
 * Renders the localized field-guide entry for one collected specimen:
 * plate/floor/NO. metadata in the chrome, the big LumeSpecimen glyph in
 * a glass plate, the localized name (with the English name beneath when
 * the active locale isn't English), the localized field notes, and the
 * timestamp from `collectedAt`. Back links to `/index`.
 *
 * Locked specimens (i.e. ones the visitor has not yet collected) are
 * redirected back to `/index` so the route never accidentally reveals
 * what's still to find.
 */

const PAGE_STYLE: CSSProperties = {
  minHeight: "100dvh",
  background: LU.aurora.page,
  color: LU.base.ink,
  display: "flex",
  flexDirection: "column",
  padding:
    "max(40px, env(safe-area-inset-top)) 20px max(40px, env(safe-area-inset-bottom))",
  gap: 20,
};

const HEADER_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const BACK_LINK_STYLE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  fontSize: 14,
  color: LU.base.ink2,
  textDecoration: "none",
  cursor: "pointer",
};

const META_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: 12,
  fontFamily: "var(--lu-font-mono)",
  fontSize: 11,
  letterSpacing: 2,
  textTransform: "uppercase",
  color: LU.base.ink3,
};

const PLATE_STYLE: CSSProperties = {
  alignSelf: "center",
  width: "min(360px, 90%)",
  aspectRatio: "1 / 1",
  borderRadius: 28,
  border: `1px solid ${LU.rule.hair}`,
  background: LU.glass.surface1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  overflow: "hidden",
};

const NAME_BLOCK_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 4,
  textAlign: "center",
};

const NAME_PRIMARY_STYLE: CSSProperties = {
  fontSize: 28,
  fontWeight: 600,
  letterSpacing: -0.4,
  margin: 0,
};

const NAME_SECONDARY_STYLE: CSSProperties = {
  fontFamily: "var(--lu-font-mono)",
  fontSize: 12,
  letterSpacing: 2,
  textTransform: "uppercase",
  color: LU.base.ink3,
};

const NOTES_STYLE: CSSProperties = {
  color: LU.base.ink2,
  fontSize: 15,
  lineHeight: 1.55,
  margin: "4px auto 0",
  maxWidth: 460,
  textAlign: "center",
};

const TIMESTAMP_STYLE: CSSProperties = {
  fontFamily: "var(--lu-font-mono)",
  fontSize: 11,
  letterSpacing: 1.5,
  textTransform: "uppercase",
  color: LU.base.ink3,
  textAlign: "center",
};

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
      router.replace("/index");
    }
  }, [hydrated, specimen, collectedNumbers, router]);

  if (!specimen) {
    notFound();
  }

  const localizedName = specimen.name[lang];
  const localizedNotes = specimen.notes[lang];
  const showEnglishSubtitle = lang !== "en";

  const collectedAtText = formatCollectedAt(
    state.collectedAt[specimen.number],
    lang,
    t.specimen_collected_at
  );

  return (
    <main style={PAGE_STYLE}>
      <header style={HEADER_STYLE}>
        <Link href="/index" style={BACK_LINK_STYLE}>
          <span aria-hidden="true">←</span>
          <span>{t.specimen_back}</span>
        </Link>
        <span style={META_STYLE}>
          <span>
            {t.specimen_plate_label} {specimen.plate}
          </span>
          <span style={{ color: LU.rule.strong }}>·</span>
          <span>
            {t.specimen_floor_label} {specimen.floor}
          </span>
          <span style={{ color: LU.rule.strong }}>·</span>
          <span>
            {t.specimen_number_label} {String(specimen.number).padStart(2, "0")}
          </span>
        </span>
      </header>

      <section style={PLATE_STYLE}>
        <PlateBackdrop specimen={specimen} />
        <div style={{ position: "relative" }}>
          <LumeSpecimenView
            form={specimen.form}
            glow={0.7}
            hue={specimen.hue}
            size={224}
          />
        </div>
      </section>

      <section style={NAME_BLOCK_STYLE}>
        <h1 style={NAME_PRIMARY_STYLE}>{localizedName}</h1>
        {showEnglishSubtitle ? (
          <span style={NAME_SECONDARY_STYLE}>{specimen.name.en}</span>
        ) : null}
      </section>

      <p style={NOTES_STYLE}>{localizedNotes}</p>

      {collectedAtText ? (
        <p style={TIMESTAMP_STYLE}>{collectedAtText}</p>
      ) : null}
    </main>
  );
}
