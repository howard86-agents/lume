"use client";

import { LU } from "@lume/data/tokens";
import { useRouter } from "next/navigation";
import { useLocale } from "../../components/lume-provider";

/**
 * Camera permission pre-prompt — `/permission`.
 *
 * Pure UI / nav step that explains why the camera is needed before the
 * browser's getUserMedia prompt fires on `/scan`. Allow takes the
 * visitor into the scanner; Not-now routes to `/collection` so they can
 * still browse what they have collected and use manual entry later.
 *
 * Important: this route does not invoke any camera API. The real
 * getUserMedia call lives in the scanner permission slice (#20) so the
 * visitor sees this rationale before the OS-level prompt appears.
 */

function CameraIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height={48}
      viewBox="0 0 48 48"
      width={48}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Camera</title>
      <rect
        height={28}
        rx={6}
        ry={6}
        stroke={LU.accent.amber}
        strokeWidth={2}
        width={36}
        x={6}
        y={12}
      />
      <path
        d="M18 12 L20 8 L28 8 L30 12"
        stroke={LU.accent.amber}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
      <circle cx={24} cy={26} r={7} stroke={LU.accent.amber} strokeWidth={2} />
      <circle cx={36} cy={18} fill={LU.accent.amber} r={1.5} />
    </svg>
  );
}

export default function PermissionPage() {
  const router = useRouter();
  const { t } = useLocale();
  return (
    <main className="flex min-h-[var(--lu-screen-h)] flex-col gap-6 bg-aurora-page px-6 pt-[max(48px,env(safe-area-inset-top))] pb-[max(40px,env(safe-area-inset-bottom))] text-ink">
      <div className="my-auto flex flex-col items-center gap-[14px]">
        <div className="font-mono-lu text-[11px] text-ink-2 uppercase tracking-[3px]">
          {t.permission_before_we_begin}
        </div>
        <section className="flex flex-col items-center gap-4 self-stretch rounded-3xl border border-rule-hair bg-glass-1 px-6 py-8 text-center backdrop-blur-[16px]">
          <span
            className="flex h-24 w-24 items-center justify-center rounded-full"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(255,183,85,0.30) 0%, rgba(255,183,85,0) 70%)",
            }}
          >
            <CameraIcon />
          </span>
          <h1 className="m-0 font-semibold text-[24px] tracking-[-0.3px]">
            {t.permission_title}
          </h1>
          <p className="m-0 max-w-[360px] text-[15px] text-ink-2 leading-normal">
            {t.permission_body}
          </p>
        </section>
      </div>

      <footer className="mt-auto flex flex-col gap-3">
        <button
          className="w-full cursor-pointer appearance-none rounded-full border border-rule-strong bg-glass-3 px-6 py-4 font-semibold text-base text-ink tracking-[0.4px]"
          onClick={() => router.push("/scan")}
          type="button"
        >
          {t.permission_allow}
        </button>
        <button
          className="cursor-pointer appearance-none self-center border-none bg-transparent px-6 py-3 text-ink-2 text-sm"
          onClick={() => router.push("/collection")}
          type="button"
        >
          {t.permission_not_now}
        </button>
      </footer>
    </main>
  );
}
