import { LUME_FORM_NAMES } from "@lume/data/glyphs";
import {
  getSpecimenVisual,
  LUME_SPECIMENS,
  LUME_SPECIMENS_BY_FLOOR,
  LUME_TOTAL_SPECIMENS,
  type LumeSpecimen,
  SAMPLE_FOUND,
} from "@lume/data/specimens";
import { LU } from "@lume/data/tokens";
import type { CSSProperties } from "react";
import { LumeSpecimen as LumeSpecimenView } from "../../../components/specimen/lume-specimen";

export const metadata = {
  title: "Lume — Specimens preview",
};

const SECTION_STYLE: CSSProperties = {
  padding: "32px 24px",
  borderTop: `1px solid ${LU.rule.hair}`,
};

const TILE_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
  padding: "20px 16px 16px",
  borderRadius: 18,
  border: `1px solid ${LU.rule.hair}`,
  background: LU.glass.surface1,
  textAlign: "center",
};

const NUMBER_STYLE: CSSProperties = {
  fontFamily: "var(--lu-font-mono)",
  fontSize: 11,
  letterSpacing: 2,
  textTransform: "uppercase",
  color: LU.base.ink3,
};

const NAME_STYLE: CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: LU.base.ink,
  letterSpacing: 0.2,
};

const META_STYLE: CSSProperties = {
  fontFamily: "var(--lu-font-mono)",
  fontSize: 11,
  color: LU.base.ink3,
};

function SpecimenTile({ specimen }: { specimen: LumeSpecimen }) {
  const found = SAMPLE_FOUND.includes(specimen.number);
  // The system preview is a static dev surface with no useLocale wiring,
  // so we resolve alt text against English. Visitor-facing surfaces still
  // resolve against the active locale.
  const visual = getSpecimenVisual(specimen, "en");
  return (
    <article style={TILE_STYLE}>
      <span style={NUMBER_STYLE}>
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
      <div style={NAME_STYLE}>{specimen.name.en}</div>
      <div style={META_STYLE}>
        FLOOR {specimen.floor} · PLATE {specimen.plate} · {specimen.form}
      </div>
      <div
        style={{
          fontFamily: "var(--lu-font-mono)",
          fontSize: 10,
          color: LU.base.ink3,
          letterSpacing: 1,
          textTransform: "lowercase",
        }}
      >
        {specimen.qr}
      </div>
    </article>
  );
}

function FormCard({ form }: { form: (typeof LUME_FORM_NAMES)[number] }) {
  return (
    <article style={TILE_STYLE}>
      <span style={NUMBER_STYLE}>{form}</span>
      <LumeSpecimenView form={form} glow={0.55} hue="cyan" size={108} />
    </article>
  );
}

export default function SpecimensPreviewPage() {
  const foundCount = SAMPLE_FOUND.length;
  return (
    <main
      style={{
        minHeight: "var(--lu-screen-h)",
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
          Lume specimens preview
        </p>
        <h1
          style={{
            fontSize: 40,
            fontWeight: 600,
            letterSpacing: -0.5,
            margin: "8px 0 0",
          }}
        >
          {LUME_TOTAL_SPECIMENS} light-forms
        </h1>
        <p style={{ color: LU.base.ink2, margin: "8px 0 0", maxWidth: 560 }}>
          Internal preview of every specimen tile in its found and locked state.
          Sample-found is hard-coded to {foundCount} specimens to mirror the
          design preview the gallery is being built against.
        </p>
      </header>

      {([1, 2, 3, 4] as const).map((floor) => (
        <section key={floor} style={SECTION_STYLE}>
          <header
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <h2
              style={{
                fontSize: 14,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: LU.base.ink2,
                margin: 0,
              }}
            >
              Floor {floor}
            </h2>
            <span style={META_STYLE}>
              {
                LUME_SPECIMENS_BY_FLOOR[floor].filter((s) =>
                  SAMPLE_FOUND.includes(s.number)
                ).length
              }
              {" / "}
              {LUME_SPECIMENS_BY_FLOOR[floor].length} sample-found
            </span>
          </header>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 16,
            }}
          >
            {LUME_SPECIMENS_BY_FLOOR[floor].map((s) => (
              <SpecimenTile key={s.number} specimen={s} />
            ))}
          </div>
        </section>
      ))}

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
          Form library ({LUME_FORM_NAMES.length} forms)
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 16,
          }}
        >
          {LUME_FORM_NAMES.map((form) => (
            <FormCard form={form} key={form} />
          ))}
        </div>
      </section>

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
          Locked-state preview
        </h2>
        <p style={{ color: LU.base.ink3, margin: "0 0 16px", fontSize: 13 }}>
          Every specimen rendered as a locked tile (dimmed silhouette + faint
          halo) so the gallery knows what an unfound entry should look like.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: 16,
          }}
        >
          {LUME_SPECIMENS.map((s) => (
            <article
              key={s.number}
              style={{ ...TILE_STYLE, padding: "16px 12px" }}
            >
              <span style={NUMBER_STYLE}>
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
