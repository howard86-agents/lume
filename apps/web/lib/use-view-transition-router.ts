"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

/**
 * CSS-driven navigation router wrapper.
 *
 * Wraps next/navigation's useRouter so route changes animate via CSS
 * enter-only transforms (no View Transitions API). The direction is stored
 * in a module-scoped variable before navigating; app/template.tsx reads it
 * on mount via consumeNavDirection() to apply the matching enter class.
 */

type NavDirection = "forward" | "back" | "sheet" | "sheet-close" | "morph";

interface NavigateOptions {
  /** Animation direction; defaults to "forward". */
  mode?: NavDirection;
  /** Use router.replace instead of router.push (no new history entry). */
  replace?: boolean;
}

// "initial" is the cold-load state: no enter animation and no content cascade
// until the first client navigation sets a real direction.
let pendingDirection: NavDirection | "initial" = "initial";

/** Read the current navigation direction (consumed by app/template.tsx). */
export const consumeNavDirection = (): NavDirection | "initial" =>
  pendingDirection;

export function useViewTransitionRouter() {
  const router = useRouter();

  const navigate = useCallback(
    (href: string, options?: NavigateOptions) => {
      pendingDirection = options?.mode ?? "forward";
      if (options?.replace) {
        router.replace(href);
      } else {
        router.push(href);
      }
    },
    [router]
  );

  const back = useCallback(() => {
    pendingDirection = "back";
    router.back();
  }, [router]);

  return { navigate, back };
}
