"use client";

import { type RefObject, useEffect, useState } from "react";

/**
 * Shared IntersectionObserver — one instance for all subscribers.
 * Returns whether the referenced element is currently in the viewport.
 */

interface Entry {
  cb: (visible: boolean) => void;
  ref: Element;
}

let observer: IntersectionObserver | null = null;
const entries = new Map<Element, Entry>();

function getObserver(): IntersectionObserver {
  if (!observer) {
    observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          entries.get(record.target)?.cb(record.isIntersecting);
        }
      },
      { rootMargin: "100px" }
    );
  }
  return observer;
}

export function useInViewport(ref: RefObject<Element | null>): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const obs = getObserver();
    entries.set(el, { ref: el, cb: setVisible });
    obs.observe(el);
    return () => {
      obs.unobserve(el);
      entries.delete(el);
    };
  }, [ref]);

  return visible;
}
