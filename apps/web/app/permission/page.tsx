"use client";

import { LU } from "@lume/data/tokens";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { useLocale } from "../../components/lume-provider";

/**
 * Camera permission pre-prompt — `/permission`.
 *
 * Pure UI / nav step that explains why the camera is needed before the
 * browser's getUserMedia prompt fires on `/scan`. Allow takes the
 * visitor into the scanner; Not-now routes to `/index` so they can
 * still browse what they have collected and use manual entry later.
 *
 * Important: this route does not invoke any camera API. The real
 * getUserMedia call lives in the scanner permission slice (#20) so the
 * visitor sees this rationale before the OS-level prompt appears.
 */

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

const CONTENT_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 14,
  marginTop: "auto",
  marginBottom: "auto",
};

const EYEBROW_STYLE: CSSProperties = {
  fontFamily: "var(--lu-font-mono)",
  fontSize: 11,
  letterSpacing: 3,
  textTransform: "uppercase",
  color: LU.base.ink2,
};

const CARD_STYLE: CSSProperties = {
  alignSelf: "stretch",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  gap: 16,
  padding: "32px 24px",
  borderRadius: 24,
  border: `1px solid ${LU.rule.hair}`,
  background: LU.glass.surface1,
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
};

const ICON_STYLE: CSSProperties = {
  width: 96,
  height: 96,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    "radial-gradient(circle at 50% 50%, rgba(255,183,85,0.30) 0%, rgba(255,183,85,0) 70%)",
};

const TITLE_STYLE: CSSProperties = {
  fontSize: 24,
  fontWeight: 600,
  letterSpacing: -0.3,
  margin: 0,
};

const BODY_STYLE: CSSProperties = {
  color: LU.base.ink2,
  fontSize: 15,
  lineHeight: 1.5,
  margin: 0,
  maxWidth: 360,
};

const FOOTER_STYLE: CSSProperties = {
  marginTop: "auto",
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const PRIMARY_STYLE: CSSProperties = {
  appearance: "none",
  border: `1px solid ${LU.accent.amber}`,
  background: "rgba(255, 183, 85, 0.16)",
  color: LU.base.ink,
  padding: "16px 24px",
  borderRadius: 999,
  fontSize: 16,
  fontWeight: 600,
  letterSpacing: 0.4,
  cursor: "pointer",
  width: "100%",
  boxShadow: "0 0 0 1px rgba(255, 183, 85, 0.35)",
};

const SECONDARY_STYLE: CSSProperties = {
  appearance: "none",
  background: "transparent",
  color: LU.base.ink2,
  border: "none",
  padding: "12px 24px",
  fontSize: 14,
  cursor: "pointer",
  alignSelf: "center",
};

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
    <main style={PAGE_STYLE}>
      <div style={CONTENT_STYLE}>
        <div style={EYEBROW_STYLE}>{t.permission_before_we_begin}</div>
        <section style={CARD_STYLE}>
          <span style={ICON_STYLE}>
            <CameraIcon />
          </span>
          <h1 style={TITLE_STYLE}>{t.permission_title}</h1>
          <p style={BODY_STYLE}>{t.permission_body}</p>
        </section>
      </div>

      <footer style={FOOTER_STYLE}>
        <button
          onClick={() => router.push("/scan")}
          style={PRIMARY_STYLE}
          type="button"
        >
          {t.permission_allow}
        </button>
        <button
          onClick={() => router.push("/index")}
          style={SECONDARY_STYLE}
          type="button"
        >
          {t.permission_not_now}
        </button>
      </footer>
    </main>
  );
}
