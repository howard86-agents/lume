import { LU, LU_ACCENTS } from "@lume/data/tokens";
import type { CSSProperties } from "react";

export const metadata = {
  title: "Lume — System preview",
};

const TYPE_SCALE = [
  { label: "Display 96", size: 96, weight: 700, sample: "Lume." },
  { label: "Display 64", size: 64, weight: 600, sample: "23 light-forms" },
  { label: "Display 40", size: 40, weight: 600, sample: "Four floors" },
  { label: "Heading 28", size: 28, weight: 600, sample: "Camera permission" },
  {
    label: "Body 18",
    size: 18,
    weight: 400,
    sample: "Walk the venue and collect every glow.",
  },
  {
    label: "Body 16",
    size: 16,
    weight: 400,
    sample: "Scan a code to add it to your index.",
  },
  {
    label: "Caption 13",
    size: 13,
    weight: 500,
    sample: "PLATE · FLOOR · NO.",
  },
] as const;

const MONO_SAMPLE = "?c=LU-08-cyan-12";

const SECTION_STYLE: CSSProperties = {
  padding: "32px 24px",
  borderTop: `1px solid ${LU.rule.hair}`,
};

const RULE_TILE_HEIGHT = 4;
const SWATCH_SIZE = 88;

function PaletteRow({
  title,
  entries,
}: {
  title: string;
  entries: { name: string; value: string }[];
}) {
  return (
    <section style={SECTION_STYLE}>
      <h2
        style={{
          fontSize: 14,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: LU.base.ink2,
          margin: "0 0 16px",
        }}
      >
        {title}
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 16,
        }}
      >
        {entries.map((entry) => (
          <article
            key={entry.name}
            style={{
              borderRadius: 16,
              overflow: "hidden",
              border: `1px solid ${LU.rule.hair}`,
              background: LU.glass.surface1,
            }}
          >
            <div
              style={{
                height: SWATCH_SIZE,
                background: entry.value,
              }}
            />
            <div style={{ padding: "10px 12px" }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: LU.base.ink,
                }}
              >
                {entry.name}
              </div>
              <div
                style={{
                  fontFamily: "var(--lu-font-mono)",
                  fontSize: 11,
                  color: LU.base.ink3,
                  marginTop: 2,
                  wordBreak: "break-all",
                }}
              >
                {entry.value}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function SystemPreviewPage() {
  const baseEntries = Object.entries(LU.base).map(([name, value]) => ({
    name: `base.${name}`,
    value,
  }));
  const glassEntries = Object.entries(LU.glass).map(([name, value]) => ({
    name: `glass.${name}`,
    value,
  }));
  const accentEntries = LU_ACCENTS.map((name) => ({
    name: `accent.${name}`,
    value: LU.accent[name],
  }));
  const ruleEntries = Object.entries(LU.rule).map(([name, value]) => ({
    name: `rule.${name}`,
    value,
  }));
  const auroraEntries = Object.entries(LU.aurora).map(([name, value]) => ({
    name: `aurora.${name}`,
    value,
  }));

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: LU.aurora.page,
        color: LU.base.ink,
        padding: "48px 0 64px",
      }}
    >
      <header style={{ padding: "0 24px 24px" }}>
        <p
          style={{
            fontFamily: "var(--lu-font-mono)",
            fontSize: 12,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: LU.base.ink2,
            margin: 0,
          }}
        >
          Lume system preview
        </p>
        <h1
          style={{
            fontSize: 40,
            fontWeight: 600,
            letterSpacing: -0.5,
            margin: "8px 0 0",
          }}
        >
          Type scale &amp; palette
        </h1>
        <p style={{ color: LU.base.ink2, margin: "8px 0 0", maxWidth: 560 }}>
          Internal preview surfaced for design + dev to verify Lume tokens and
          fonts render as expected. Not part of the visitor flow.
        </p>
      </header>

      <section style={SECTION_STYLE}>
        <h2
          style={{
            fontSize: 14,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: LU.base.ink2,
            margin: "0 0 16px",
          }}
        >
          Type scale
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {TYPE_SCALE.map((entry) => (
            <div
              key={entry.label}
              style={{
                display: "flex",
                gap: 24,
                alignItems: "baseline",
                borderTop: `1px solid ${LU.rule.hair}`,
                paddingTop: 12,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--lu-font-mono)",
                  color: LU.base.ink3,
                  fontSize: 12,
                  flex: "0 0 96px",
                }}
              >
                {entry.label}
              </div>
              <div
                style={{
                  fontSize: entry.size,
                  fontWeight: entry.weight,
                  lineHeight: 1.05,
                  letterSpacing: entry.size >= 40 ? -0.5 : 0,
                }}
              >
                {entry.sample}
              </div>
            </div>
          ))}
          <div
            style={{
              borderTop: `1px solid ${LU.rule.hair}`,
              paddingTop: 12,
              display: "flex",
              gap: 24,
              alignItems: "baseline",
            }}
          >
            <div
              style={{
                fontFamily: "var(--lu-font-mono)",
                color: LU.base.ink3,
                fontSize: 12,
                flex: "0 0 96px",
              }}
            >
              Mono 14
            </div>
            <div
              style={{
                fontFamily: "var(--lu-font-mono)",
                fontSize: 14,
                color: LU.base.ink2,
              }}
            >
              {MONO_SAMPLE}
            </div>
          </div>
        </div>
      </section>

      <PaletteRow entries={baseEntries} title="Base canvas + ink" />
      <PaletteRow entries={glassEntries} title="Glass surface tiers" />
      <PaletteRow entries={accentEntries} title="Accent hues" />

      <section style={SECTION_STYLE}>
        <h2
          style={{
            fontSize: 14,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: LU.base.ink2,
            margin: "0 0 16px",
          }}
        >
          Rules / hairlines
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {ruleEntries.map((entry) => (
            <article
              key={entry.name}
              style={{
                borderRadius: 16,
                padding: 16,
                background: LU.glass.surface1,
                border: `1px solid ${LU.rule.hair}`,
              }}
            >
              <div
                style={{
                  height: RULE_TILE_HEIGHT,
                  background: entry.value,
                  borderRadius: 999,
                }}
              />
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  marginTop: 12,
                }}
              >
                {entry.name}
              </div>
              <div
                style={{
                  fontFamily: "var(--lu-font-mono)",
                  fontSize: 11,
                  color: LU.base.ink3,
                  marginTop: 2,
                }}
              >
                {entry.value}
              </div>
            </article>
          ))}
        </div>
      </section>

      <PaletteRow entries={auroraEntries} title="Aurora gradients" />
    </main>
  );
}
