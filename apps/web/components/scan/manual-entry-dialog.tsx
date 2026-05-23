"use client";

import type { ReactElement } from "react";
import { useLocale } from "../lume-provider";

/**
 * Manual code-entry dialog.
 *
 * A modal input the visitor opens from /scan when the camera is
 * unavailable, denied, or just slow to focus. Submitting funnels the
 * payload through the same useLume().collect() path the decode loop
 * uses, so the success/duplicate/invalid overlays light up identically.
 */

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
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-[8px]"
      role="dialog"
      style={{ background: "rgba(8, 8, 13, 0.65)" }}
    >
      <form
        className="flex w-full max-w-[420px] flex-col gap-4 rounded-3xl border border-rule-strong bg-glass-3 p-[24px_24px_20px] backdrop-blur-[20px]"
        onSubmit={(e) => {
          e.preventDefault();
          if (trimmed.length === 0) {
            return;
          }
          onSubmit(trimmed);
        }}
      >
        <h2 className="m-0 font-semibold text-xl">{t.scan_manual_title}</h2>
        <input
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          autoFocus
          className="w-full appearance-none rounded-xl border border-rule-strong bg-glass-1 p-[14px_16px] font-mono-lu text-base text-ink tracking-[0.5px]"
          inputMode="text"
          onChange={(e) => onChange(e.target.value)}
          placeholder={t.scan_manual_placeholder}
          type="text"
          value={input}
        />
        <div className="flex justify-end gap-3">
          <button
            className="cursor-pointer appearance-none border-none bg-transparent px-5 py-3 text-ink-2 text-sm"
            onClick={onCancel}
            type="button"
          >
            {t.scan_manual_cancel}
          </button>
          <button
            className="cursor-pointer appearance-none rounded-full border border-amber bg-[rgba(255,183,85,0.16)] px-5 py-3 font-semibold text-ink text-sm shadow-[0_0_0_1px_rgba(255,183,85,0.35)]"
            disabled={trimmed.length === 0}
            style={{
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
