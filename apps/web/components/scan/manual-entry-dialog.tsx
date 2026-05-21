"use client";

import { LU } from "@lume/data/tokens";
import type { CSSProperties, ReactElement } from "react";
import { useLocale } from "../lume-provider";

/**
 * Manual code-entry dialog.
 *
 * A modal input the visitor opens from /scan when the camera is
 * unavailable, denied, or just slow to focus. Submitting funnels the
 * payload through the same useLume().collect() path the decode loop
 * uses, so the success/duplicate/invalid overlays light up identically.
 */

const BACKDROP_STYLE: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(8, 8, 13, 0.65)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  zIndex: 50,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
};

const DIALOG_STYLE: CSSProperties = {
  width: "100%",
  maxWidth: 420,
  background: LU.glass.surface3,
  border: `1px solid ${LU.rule.strong}`,
  borderRadius: 24,
  padding: "24px 24px 20px",
  display: "flex",
  flexDirection: "column",
  gap: 16,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
};

const TITLE_STYLE: CSSProperties = {
  margin: 0,
  fontSize: 20,
  fontWeight: 600,
};

const INPUT_STYLE: CSSProperties = {
  appearance: "none",
  width: "100%",
  border: `1px solid ${LU.rule.strong}`,
  borderRadius: 12,
  padding: "14px 16px",
  background: LU.glass.surface1,
  color: LU.base.ink,
  fontSize: 16,
  fontFamily: "var(--lu-font-mono)",
  letterSpacing: 0.5,
};

const ACTIONS_STYLE: CSSProperties = {
  display: "flex",
  gap: 12,
  justifyContent: "flex-end",
};

const PRIMARY_STYLE: CSSProperties = {
  appearance: "none",
  border: `1px solid ${LU.accent.amber}`,
  background: "rgba(255, 183, 85, 0.16)",
  color: LU.base.ink,
  padding: "12px 20px",
  borderRadius: 999,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 0 0 1px rgba(255, 183, 85, 0.35)",
};

const SECONDARY_STYLE: CSSProperties = {
  appearance: "none",
  border: "none",
  background: "transparent",
  color: LU.base.ink2,
  padding: "12px 20px",
  fontSize: 14,
  cursor: "pointer",
};

interface ManualEntryDialogProps {
  input: string;
  onCancel: () => void;
  onChange: (value: string) => void;
  onSubmit: (payload: string) => void;
}

export function ManualEntryDialog({
  input,
  onChange,
  onCancel,
  onSubmit,
}: ManualEntryDialogProps): ReactElement {
  const { t } = useLocale();
  const trimmed = input.trim();
  return (
    <div aria-modal="true" role="dialog" style={BACKDROP_STYLE}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (trimmed.length === 0) {
            return;
          }
          onSubmit(trimmed);
        }}
        style={DIALOG_STYLE}
      >
        <h2 style={TITLE_STYLE}>{t.scan_manual_title}</h2>
        <input
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          autoFocus
          inputMode="text"
          onChange={(e) => onChange(e.target.value)}
          placeholder={t.scan_manual_placeholder}
          style={INPUT_STYLE}
          type="text"
          value={input}
        />
        <div style={ACTIONS_STYLE}>
          <button onClick={onCancel} style={SECONDARY_STYLE} type="button">
            {t.scan_manual_cancel}
          </button>
          <button
            disabled={trimmed.length === 0}
            style={{
              ...PRIMARY_STYLE,
              opacity: trimmed.length === 0 ? 0.5 : 1,
              cursor: trimmed.length === 0 ? "not-allowed" : "pointer",
            }}
            type="submit"
          >
            {t.scan_manual_submit}
          </button>
        </div>
      </form>
    </div>
  );
}
