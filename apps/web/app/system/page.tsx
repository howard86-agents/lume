import { LU, LU_ACCENTS } from "@lume/data/tokens";

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

const SWATCH_SIZE = 88;
const RULE_TILE_HEIGHT = 4;

function PaletteRow({
  title,
  entries,
}: {
  title: string;
  entries: { name: string; value: string }[];
}) {
  return (
    <section className="border-rule-hair border-t px-6 py-8">
      <h2 className="m-0 mb-4 text-ink-2 text-sm uppercase tracking-[2px]">
        {title}
      </h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4">
        {entries.map((entry) => (
          <article
            className="overflow-hidden rounded-[16px] border border-rule-hair bg-glass-1"
            key={entry.name}
          >
            <div style={{ height: SWATCH_SIZE, background: entry.value }} />
            <div className="px-3 py-2.5">
              <div className="font-medium text-[13px] text-ink">
                {entry.name}
              </div>
              <div className="mt-[2px] break-all font-mono-lu text-[11px] text-ink-3">
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
    <main className="min-h-[var(--lu-screen-h)] bg-aurora-page pt-12 pb-16 text-ink">
      <header className="px-6 pb-6">
        <p className="m-0 font-mono-lu text-ink-2 text-xs uppercase tracking-[2px]">
          Lume system preview
        </p>
        <h1 className="m-0 mt-2 font-semibold text-[40px] tracking-[-0.5px]">
          Type scale &amp; palette
        </h1>
        <p className="m-0 mt-2 max-w-[560px] text-ink-2">
          Internal preview surfaced for design + dev to verify Lume tokens and
          fonts render as expected. Not part of the visitor flow.
        </p>
      </header>

      <section className="border-rule-hair border-t px-6 py-8">
        <h2 className="m-0 mb-4 text-ink-2 text-sm uppercase tracking-[2px]">
          Type scale
        </h2>
        <div className="flex flex-col gap-[18px]">
          {TYPE_SCALE.map((entry) => (
            <div
              className="flex items-baseline gap-6 border-rule-hair border-t pt-3"
              key={entry.label}
            >
              <div className="flex-[0_0_96px] font-mono-lu text-ink-3 text-xs">
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
          <div className="flex items-baseline gap-6 border-rule-hair border-t pt-3">
            <div className="flex-[0_0_96px] font-mono-lu text-ink-3 text-xs">
              Mono 14
            </div>
            <div className="font-mono-lu text-ink-2 text-sm">{MONO_SAMPLE}</div>
          </div>
        </div>
      </section>

      <PaletteRow entries={baseEntries} title="Base canvas + ink" />
      <PaletteRow entries={glassEntries} title="Glass surface tiers" />
      <PaletteRow entries={accentEntries} title="Accent hues" />

      <section className="border-rule-hair border-t px-6 py-8">
        <h2 className="m-0 mb-4 text-ink-2 text-sm uppercase tracking-[2px]">
          Rules / hairlines
        </h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
          {ruleEntries.map((entry) => (
            <article
              className="rounded-[16px] border border-rule-hair bg-glass-1 p-4"
              key={entry.name}
            >
              <div
                className="rounded-full"
                style={{
                  height: RULE_TILE_HEIGHT,
                  background: entry.value,
                }}
              />
              <div className="mt-3 font-medium text-[13px]">{entry.name}</div>
              <div className="mt-[2px] font-mono-lu text-[11px] text-ink-3">
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
