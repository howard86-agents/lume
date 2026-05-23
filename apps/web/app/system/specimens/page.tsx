import { LUME_FORM_NAMES } from "@lume/data/glyphs";
import {
  getSpecimenVisual,
  LUME_SPECIMENS,
  LUME_SPECIMENS_BY_FLOOR,
  LUME_TOTAL_SPECIMENS,
  type LumeSpecimen,
  SAMPLE_FOUND,
} from "@lume/data/specimens";
import { LumeSpecimen as LumeSpecimenView } from "../../../components/specimen/lume-specimen";

export const metadata = {
  title: "Lume — Specimens preview",
};

function SpecimenTile({ specimen }: { specimen: LumeSpecimen }) {
  const found = SAMPLE_FOUND.includes(specimen.number);
  const visual = getSpecimenVisual(specimen, "en");
  return (
    <article className="flex flex-col items-center gap-3 rounded-[18px] border border-rule-hair bg-glass-1 px-4 pt-5 pb-4 text-center">
      <span className="font-mono-lu text-[11px] text-ink-3 uppercase tracking-[2px]">
        NO. {String(specimen.number).padStart(2, "0")}
      </span>
      <LumeSpecimenView
        form={specimen.form}
        found={found}
        glow={0.6}
        hue={specimen.hue}
        image={visual.kind === "image" ? visual : undefined}
        size={108}
      />
      <div className="font-semibold text-[15px] text-ink tracking-[0.2px]">
        {specimen.name.en}
      </div>
      <div className="font-mono-lu text-[11px] text-ink-3">
        FLOOR {specimen.floor} · PLATE {specimen.plate} · {specimen.form}
      </div>
      <div className="font-mono-lu text-[10px] text-ink-3 lowercase tracking-[1px]">
        {specimen.qr}
      </div>
    </article>
  );
}

function FormCard({ form }: { form: (typeof LUME_FORM_NAMES)[number] }) {
  return (
    <article className="flex flex-col items-center gap-3 rounded-[18px] border border-rule-hair bg-glass-1 px-4 pt-5 pb-4 text-center">
      <span className="font-mono-lu text-[11px] text-ink-3 uppercase tracking-[2px]">
        {form}
      </span>
      <LumeSpecimenView form={form} glow={0.55} hue="cyan" size={108} />
    </article>
  );
}

export default function SpecimensPreviewPage() {
  const foundCount = SAMPLE_FOUND.length;
  return (
    <main className="min-h-[var(--lu-screen-h)] bg-aurora-page pt-12 pb-16 text-ink">
      <header className="px-6 pb-6">
        <p className="m-0 font-mono-lu text-ink-2 text-xs uppercase tracking-[2px]">
          Lume specimens preview
        </p>
        <h1 className="m-0 mt-2 font-semibold text-[40px] tracking-[-0.5px]">
          {LUME_TOTAL_SPECIMENS} light-forms
        </h1>
        <p className="m-0 mt-2 max-w-[560px] text-ink-2">
          Internal preview of every specimen tile in its found and locked state.
          Sample-found is hard-coded to {foundCount} specimens to mirror the
          design preview the gallery is being built against.
        </p>
      </header>

      {([1, 2, 3, 4] as const).map((floor) => (
        <section className="border-rule-hair border-t px-6 py-8" key={floor}>
          <header className="mb-4 flex items-baseline justify-between">
            <h2 className="m-0 text-ink-2 text-sm uppercase tracking-[2px]">
              Floor {floor}
            </h2>
            <span className="font-mono-lu text-[11px] text-ink-3">
              {
                LUME_SPECIMENS_BY_FLOOR[floor].filter((s) =>
                  SAMPLE_FOUND.includes(s.number)
                ).length
              }
              {" / "}
              {LUME_SPECIMENS_BY_FLOOR[floor].length} sample-found
            </span>
          </header>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
            {LUME_SPECIMENS_BY_FLOOR[floor].map((s) => (
              <SpecimenTile key={s.number} specimen={s} />
            ))}
          </div>
        </section>
      ))}

      <section className="border-rule-hair border-t px-6 py-8">
        <h2 className="m-0 mb-4 text-ink-2 text-sm uppercase tracking-[2px]">
          Form library ({LUME_FORM_NAMES.length} forms)
        </h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
          {LUME_FORM_NAMES.map((form) => (
            <FormCard form={form} key={form} />
          ))}
        </div>
      </section>

      <section className="border-rule-hair border-t px-6 py-8">
        <h2 className="m-0 mb-4 text-ink-2 text-sm uppercase tracking-[2px]">
          Locked-state preview
        </h2>
        <p className="m-0 mb-4 text-[13px] text-ink-3">
          Every specimen rendered as a locked tile (dimmed silhouette + faint
          halo) so the gallery knows what an unfound entry should look like.
        </p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4">
          {LUME_SPECIMENS.map((s) => (
            <article
              className="flex flex-col items-center gap-3 rounded-[18px] border border-rule-hair bg-glass-1 px-3 py-4 text-center"
              key={s.number}
            >
              <span className="font-mono-lu text-[11px] text-ink-3 uppercase tracking-[2px]">
                NO. {String(s.number).padStart(2, "0")}
              </span>
              <LumeSpecimenView
                form={s.form}
                found={false}
                glow={0.45}
                hue={s.hue}
                size={84}
              />
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
