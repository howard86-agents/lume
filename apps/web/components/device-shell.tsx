import type { ReactNode } from "react";

/**
 * Desktop/tablet iPhone shell.
 *
 * At viewport widths >= 768px the three wrappers below become a centered
 * iPhone frame (see the `.lume-*` rules in globals.css). Below 768px they are
 * `display: contents`, so on real phones the app renders exactly as before.
 * Pure CSS — no client JS, no device detection.
 */
export function DeviceShell({ children }: { children: ReactNode }) {
  return (
    <div className="lume-stage">
      <div className="lume-frame">
        <div className="lume-screen">{children}</div>
      </div>
    </div>
  );
}
