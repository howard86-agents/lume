const KEY = "lume:morph-origin";
const MAX_AGE = 1500;

interface MorphOrigin {
  n: number;
  rect: { top: number; left: number; width: number; height: number };
  t: number;
}

export function setMorphOrigin(n: number, el: Element): void {
  const { top, left, width, height } = el.getBoundingClientRect();
  const entry: MorphOrigin = {
    n,
    rect: { top, left, width, height },
    t: Date.now(),
  };
  sessionStorage.setItem(KEY, JSON.stringify(entry));
}

export function consumeMorphOrigin(n: number): MorphOrigin | null {
  const raw = sessionStorage.getItem(KEY);
  if (!raw) {
    return null;
  }
  sessionStorage.removeItem(KEY);
  try {
    const entry: MorphOrigin = JSON.parse(raw);
    if (entry.n !== n || Date.now() - entry.t > MAX_AGE) {
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}
