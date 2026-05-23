"use client";

import { LU } from "@lume/data/tokens";
import { useRouter } from "next/navigation";
import { type CSSProperties, useState } from "react";
import { useLocale } from "../../components/lume-provider";
import { LumeSpecimen } from "../../components/specimen/lume-specimen";

/**
 * Onboarding primer — `/onboarding`.
 *
 * Three steps walk the visitor through the loop: find the codes,
 * collect the twenty-three, take home the field guide. Each step has
 * a localized title + body and a matching preview composition that
 * borrows the existing LumeSpecimen renderer so the primer feels like
 * the rest of the experience.
 *
 * Step dots reflect the current step; Next advances; Skip jumps out;
 * Begin (step 3) routes to `/permission` to start the camera flow.
 */

const TOTAL_STEPS = 3;

const STEP_DOT_KEYS = Array.from(
  { length: TOTAL_STEPS },
  (_, i) => `step-dot-${i}`
);

const CARD_GLOW_DOT_KEYS = Array.from(
  { length: 24 },
  (_, i) => `card-glow-dot-${i}`
);

const CARD_GLOW_DOT_HUES = [
  LU.accent.amber,
  LU.accent.cyan,
  LU.accent.magenta,
  LU.accent.mint,
  LU.accent.violet,
  LU.accent.rose,
] as const;

const PAGE_STYLE: CSSProperties = {
  minHeight: "100dvh",
  background: LU.aurora.page,
  color: LU.base.ink,
  display: "flex",
  flexDirection: "column",
  padding:
    "max(48px, env(safe-area-inset-top)) 24px max(40px, env(safe-area-inset-bottom))",
  gap: 24,
};

const HEADER_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const STEP_INDICATOR_STYLE: CSSProperties = {
  fontFamily: "var(--lu-font-mono)",
  fontSize: 11,
  letterSpacing: 3,
  textTransform: "uppercase",
  color: LU.base.ink3,
};

const SKIP_STYLE: CSSProperties = {
  appearance: "none",
  background: "transparent",
  color: LU.base.ink2,
  border: "none",
  fontSize: 14,
  cursor: "pointer",
};

const PREVIEW_STYLE: CSSProperties = {
  alignSelf: "center",
  width: "min(320px, 90%)",
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

const TITLE_STYLE: CSSProperties = {
  fontSize: 28,
  fontWeight: 600,
  letterSpacing: -0.4,
  margin: 0,
  textAlign: "center",
};

const TITLE_PREFIX_STYLE: CSSProperties = {
  color: LU.accent.amber,
  fontFamily: "var(--lu-font-mono)",
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: 2.4,
  marginRight: 10,
  verticalAlign: "middle",
};

const BODY_STYLE: CSSProperties = {
  color: LU.base.ink2,
  fontSize: 15,
  lineHeight: 1.5,
  textAlign: "center",
  maxWidth: 360,
  margin: "0 auto",
};

const DOTS_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};

const DOT_BASE_STYLE: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: "50%",
  background: LU.glass.surface3,
};

const DOT_ACTIVE_STYLE: CSSProperties = {
  ...DOT_BASE_STYLE,
  width: 22,
  background: LU.accent.amber,
  boxShadow: "0 0 12px rgba(255, 183, 85, 0.65)",
};

const FOOTER_STYLE: CSSProperties = {
  marginTop: "auto",
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const PRIMARY_STYLE: CSSProperties = {
  appearance: "none",
  border: `1px solid ${LU.rule.strong}`,
  background: LU.glass.surface3,
  color: LU.base.ink,
  padding: "16px 24px",
  borderRadius: 999,
  fontSize: 16,
  fontWeight: 600,
  letterSpacing: 0.4,
  cursor: "pointer",
  width: "100%",
};

/** Three corner finder patterns + a few data modules read clearly as a QR. */
const QR_FINDERS = [
  [33, 33],
  [61, 33],
  [33, 61],
] as const;
const QR_MODULES = [
  [52, 34],
  [58, 40],
  [52, 46],
  [80, 52],
  [74, 58],
  [86, 58],
  [54, 54],
  [62, 60],
  [54, 68],
  [80, 66],
  [56, 80],
  [64, 74],
  [72, 82],
  [82, 78],
  [70, 68],
] as const;

function StepOnePreview() {
  const dark = LU.base.deep;
  const light = LU.base.ink;
  return (
    <div
      aria-hidden="true"
      style={{
        position: "relative",
        width: "70%",
        height: "70%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: LU.aurora.halo,
          filter: "blur(28px)",
          opacity: 0.8,
        }}
      />
      <svg
        role="presentation"
        style={{ position: "relative", width: "82%", height: "82%" }}
        viewBox="0 0 120 120"
      >
        {/* QR placard the visitor is taught to look for */}
        <rect fill={light} height="64" rx="7" width="64" x="28" y="28" />
        {QR_FINDERS.map(([fx, fy]) => (
          <g key={`${fx}-${fy}`}>
            <rect fill={dark} height="16" rx="2" width="16" x={fx} y={fy} />
            <rect
              fill={light}
              height="11"
              rx="1.5"
              width="11"
              x={fx + 2.5}
              y={fy + 2.5}
            />
            <rect
              fill={dark}
              height="6"
              rx="1"
              width="6"
              x={fx + 5}
              y={fy + 5}
            />
          </g>
        ))}
        {QR_MODULES.map(([mx, my]) => (
          <rect
            fill={dark}
            height="5"
            key={`${mx}-${my}`}
            rx="1"
            width="5"
            x={mx}
            y={my}
          />
        ))}
        {/* amber scan-corner reticle */}
        <g
          fill="none"
          stroke={LU.accent.amber}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        >
          <path d="M12 34 V18 a6 6 0 0 1 6 -6 H34" />
          <path d="M86 12 H102 a6 6 0 0 1 6 6 V34" />
          <path d="M12 86 V102 a6 6 0 0 1 6 6 H34" />
          <path d="M108 86 V102 a6 6 0 0 1 -6 6 H86" />
        </g>
      </svg>
    </div>
  );
}

function StepTwoPreview() {
  const tiles: {
    form: "halo" | "ring" | "petal" | "prism" | "lattice" | "spire";
    hue: "amber" | "cyan" | "magenta" | "mint" | "violet" | "rose";
    locked?: boolean;
  }[] = [
    { form: "halo", hue: "amber" },
    { form: "ring", hue: "cyan" },
    { form: "petal", hue: "rose" },
    { form: "prism", hue: "violet", locked: true },
    { form: "lattice", hue: "magenta", locked: true },
    { form: "spire", hue: "mint", locked: true },
  ];
  return (
    <div
      aria-hidden="true"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 12,
        width: "70%",
      }}
    >
      {tiles.map((tile) =>
        tile.locked ? (
          <span
            key={`${tile.form}-${tile.hue}-locked`}
            style={{
              width: 68,
              height: 68,
              borderRadius: "50%",
              border: `1.5px dashed ${LU.base.ink3}`,
              opacity: 0.45,
            }}
          />
        ) : (
          <LumeSpecimen
            form={tile.form}
            glow={0.55}
            hue={tile.hue}
            key={`${tile.form}-${tile.hue}`}
            size={68}
          />
        )
      )}
    </div>
  );
}

function formatStepNumber(value: number) {
  return value.toString().padStart(2, "0");
}

function StepThreePreview() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "relative",
        width: "65%",
        aspectRatio: "3 / 4",
        borderRadius: 22,
        border: `1px solid ${LU.rule.strong}`,
        background: `linear-gradient(160deg, ${LU.glass.surface3}, ${LU.glass.surface1}), ${LU.aurora.halo}`,
        backgroundBlendMode: "overlay",
        boxShadow: "0 12px 36px rgba(0, 0, 0, 0.5)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "16px 18px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          fontFamily: "var(--lu-font-mono)",
          fontSize: 10,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: LU.base.ink2,
        }}
      >
        Lume · 23 / 23
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: -1 }}>23</div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, 1fr)",
          gap: 4,
        }}
      >
        {CARD_GLOW_DOT_KEYS.map((dotKey, i) => {
          const hue = CARD_GLOW_DOT_HUES[i % CARD_GLOW_DOT_HUES.length];
          return (
            <span
              key={dotKey}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: hue,
                boxShadow: `0 0 6px ${hue}`,
                opacity: i < 23 ? 1 : 0.2,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { t, format } = useLocale();
  const [step, setStep] = useState(0);
  const isLast = step === TOTAL_STEPS - 1;
  const currentStep = step + 1;

  const steps = [
    {
      title: t.onboarding_one_title,
      body: t.onboarding_one_body,
      preview: <StepOnePreview />,
    },
    {
      title: t.onboarding_two_title,
      body: t.onboarding_two_body,
      preview: <StepTwoPreview />,
    },
    {
      title: t.onboarding_three_title,
      body: t.onboarding_three_body,
      preview: <StepThreePreview />,
    },
  ];

  const goNext = () => {
    if (isLast) {
      router.push("/permission");
      return;
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  };

  return (
    <main style={PAGE_STYLE}>
      <header style={HEADER_STYLE}>
        <span style={STEP_INDICATOR_STYLE}>
          {format("onboarding_step_indicator", {
            current: formatStepNumber(currentStep),
            label: t.onboarding_how_it_works,
            total: formatStepNumber(TOTAL_STEPS),
          })}
        </span>
        <button
          onClick={() => router.push("/permission")}
          style={SKIP_STYLE}
          type="button"
        >
          {t.onboarding_skip}
        </button>
      </header>

      <section
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 20,
          justifyContent: "center",
        }}
      >
        <div style={PREVIEW_STYLE}>{steps[step].preview}</div>
        <h1 style={TITLE_STYLE}>
          <span style={TITLE_PREFIX_STYLE}>
            {formatStepNumber(currentStep)}
          </span>
          {steps[step].title}
        </h1>
        <p style={BODY_STYLE}>{steps[step].body}</p>
      </section>

      <div style={DOTS_STYLE}>
        {STEP_DOT_KEYS.map((dotKey, i) => (
          <span
            key={dotKey}
            style={i === step ? DOT_ACTIVE_STYLE : DOT_BASE_STYLE}
          />
        ))}
      </div>

      <footer style={FOOTER_STYLE}>
        <button onClick={goNext} style={PRIMARY_STYLE} type="button">
          {isLast ? t.onboarding_begin : t.onboarding_next}
        </button>
      </footer>
    </main>
  );
}
