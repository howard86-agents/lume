"use client";

import { LU } from "@lume/data/tokens";
import { useState } from "react";
import { useLocale } from "../../components/lume-provider";
import { LumeSpecimen } from "../../components/specimen/lume-specimen";
import { useViewTransitionRouter } from "../../lib/use-view-transition-router";

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
      className="relative flex h-[70%] w-[70%] items-center justify-center"
    >
      <span className="absolute inset-0 rounded-full bg-aurora-halo opacity-[0.8] blur-[28px]" />
      <svg
        className="relative h-[82%] w-[82%]"
        role="presentation"
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
    <div aria-hidden="true" className="grid w-[70%] grid-cols-3 gap-3">
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
      className="relative flex w-[65%] flex-col justify-between overflow-hidden rounded-[22px] border border-rule-strong p-4 px-[18px]"
      style={{
        aspectRatio: "3 / 4",
        background: `linear-gradient(160deg, ${LU.glass.surface3}, ${LU.glass.surface1}), ${LU.aurora.halo}`,
        backgroundBlendMode: "overlay",
        boxShadow: "0 12px 36px rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="font-mono-lu text-[10px] text-ink-2 uppercase tracking-[2px]">
        Lume · 23 / 23
      </div>
      <div className="font-bold text-[32px] tracking-[-1px]">23</div>
      <div className="grid grid-cols-[repeat(8,1fr)] gap-1">
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
  const { navigate } = useViewTransitionRouter();
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
      navigate("/permission");
      return;
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  };

  return (
    <main className="flex min-h-[var(--lu-screen-h)] flex-col gap-6 bg-aurora-page px-6 pt-[max(48px,env(safe-area-inset-top))] pb-[max(40px,env(safe-area-inset-bottom))] text-ink">
      <header className="flex items-center justify-between">
        <span className="font-mono-lu text-[11px] text-ink-3 uppercase tracking-[3px]">
          {format("onboarding_step_indicator", {
            current: formatStepNumber(currentStep),
            label: t.onboarding_how_it_works,
            total: formatStepNumber(TOTAL_STEPS),
          })}
        </span>
        <button
          className="lu-press cursor-pointer appearance-none border-none bg-transparent text-ink-2 text-sm"
          onClick={() => navigate("/permission")}
          type="button"
        >
          {t.onboarding_skip}
        </button>
      </header>

      <section className="flex flex-1 flex-col justify-center gap-5">
        <div className="relative flex aspect-square w-[min(320px,90%)] items-center justify-center self-center overflow-hidden rounded-[28px] border border-rule-hair bg-glass-1">
          {steps[step].preview}
        </div>
        <h1 className="m-0 text-center font-semibold text-[28px] tracking-[-0.4px]">
          <span className="mr-2.5 align-middle font-bold font-mono-lu text-[13px] text-amber tracking-[2.4px]">
            {formatStepNumber(currentStep)}
          </span>
          {steps[step].title}
        </h1>
        <p className="m-0 mx-auto max-w-[360px] text-center text-[15px] text-ink-2 leading-normal">
          {steps[step].body}
        </p>
      </section>

      <div className="flex items-center justify-center gap-2">
        {STEP_DOT_KEYS.map((dotKey, i) => (
          <span
            className={
              i === step
                ? "h-1.5 w-[22px] rounded-full bg-amber shadow-[0_0_12px_var(--lu-accent-amber)]"
                : "h-1.5 w-1.5 rounded-full bg-ink-3"
            }
            key={dotKey}
          />
        ))}
      </div>

      <footer className="mt-auto flex flex-col gap-3">
        <button
          className="lu-press w-full cursor-pointer appearance-none rounded-full border border-rule-strong bg-glass-3 px-6 py-4 font-semibold text-base text-ink tracking-[0.4px]"
          onClick={goNext}
          type="button"
        >
          {isLast ? t.onboarding_begin : t.onboarding_next}
        </button>
      </footer>
    </main>
  );
}
