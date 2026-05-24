"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

/**
 * View Transition-aware router wrapper.
 *
 * Wraps next/navigation's useRouter so route changes animate via the native
 * View Transitions API. The direction is written to
 * document.documentElement.dataset.vt before navigating, so the
 * `[data-vt="..."]::view-transition-*` rules in globals.css pick the right
 * push / pop / sheet animation. Browsers without startViewTransition fall
 * back to an instant navigation, so the app keeps working everywhere.
 */

type ViewTransitionMode =
  | "forward"
  | "back"
  | "sheet"
  | "sheet-close"
  | "morph";

interface NavigateOptions {
  /** Animation direction; defaults to "forward". */
  mode?: ViewTransitionMode;
  /** Use router.replace instead of router.push (no new history entry). */
  replace?: boolean;
}

type StartViewTransition = (callback: () => void) => unknown;

function runWithViewTransition(mode: ViewTransitionMode, navigate: () => void) {
  if (typeof document === "undefined") {
    navigate();
    return;
  }
  document.documentElement.dataset.vt = mode;
  const start = (
    document as Document & { startViewTransition?: StartViewTransition }
  ).startViewTransition;
  if (typeof start === "function") {
    start.call(document, navigate);
    return;
  }
  navigate();
}

export function useViewTransitionRouter() {
  const router = useRouter();

  const navigate = useCallback(
    (href: string, options?: NavigateOptions) => {
      const mode = options?.mode ?? "forward";
      runWithViewTransition(mode, () => {
        if (options?.replace) {
          router.replace(href);
        } else {
          router.push(href);
        }
      });
    },
    [router]
  );

  const back = useCallback(() => {
    runWithViewTransition("back", () => router.back());
  }, [router]);

  return { navigate, back };
}
