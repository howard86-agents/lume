/**
 * Pure Lume player-state reducer + a thin localStorage adapter.
 *
 * The provider in `lume-provider.tsx` wires this into a React context;
 * keeping the reducer pure (no React, no `window` references at module
 * scope) means the same state machine is testable under bun:test and
 * usable in SSR-friendly hydration paths without conditional imports.
 *
 * Persistence is versioned: any backwards-incompatible change to the
 * shape should bump `LUME_STATE_VERSION` so old payloads are discarded
 * cleanly rather than silently corrupted.
 */

import {
  LUME_DEFAULT_LOCALE,
  LUME_LOCALES,
  type LumeLocale,
} from "@lume/data/locales";
import {
  extractQrSlug,
  LUME_SPECIMENS_BY_QR,
  LUME_TOTAL_SPECIMENS,
  type LumeSpecimen,
  type LumeSpecimenNumber,
} from "@lume/data/specimens";

/** Bumped whenever the shape of `LumeState` changes incompatibly. */
export const LUME_STATE_VERSION = 1;

/** localStorage key the adapter reads/writes. */
export const LUME_STATE_STORAGE_KEY = "lume:state:v1";

/** The persisted player state. */
export interface LumeState {
  /** Whether the visitor has saved their achievement card. */
  cardSaved: boolean;
  /**
   * QR slugs the visitor has collected, in collection order. We keep slugs
   * (not visitor numbers) here so the canonical identifier — the printed QR
   * code — flows directly through the storage layer.
   */
  collected: readonly string[];
  /**
   * Map of specimen number -> ISO timestamp of when it was first collected.
   * Keyed by number rather than slug so the detail screen can render
   * "Collected on YYYY-MM-DD" without a join step.
   */
  collectedAt: Readonly<Record<number, string>>;
  /** Whether the visitor has seen the 23/23 reveal. */
  finalSeen: boolean;
  /** Active UI language. */
  lang: LumeLocale;
  /** Optional visitor nickname for the achievement card. */
  nickname: string;
}

/** Initial state for a brand-new visitor (no persisted payload). */
export const INITIAL_LUME_STATE: LumeState = {
  collected: [],
  collectedAt: {},
  lang: LUME_DEFAULT_LOCALE,
  nickname: "",
  finalSeen: false,
  cardSaved: false,
};

/** Outcome of a `collect` dispatch. */
export type LumeCollectResult = "new" | "dupe" | "invalid";

/** All actions the provider can dispatch onto the state machine. */
export type LumeAction =
  | { type: "collect"; payload: string; nowIso?: string }
  | { type: "setLang"; payload: LumeLocale }
  | { type: "setNickname"; payload: string }
  | { type: "setFinalSeen"; payload?: boolean }
  | { type: "setCardSaved"; payload?: boolean }
  | { type: "hydrate"; payload: LumeState }
  | { type: "reset" };

/** Reducer-step return — exposes the collect outcome alongside the new state. */
export interface LumeReduceResult {
  /** The specimen that was just collected (only on a `'new'` outcome). */
  collectedSpecimen?: LumeSpecimen;
  /** Set when the action that produced this state was a `collect`. */
  collectResult?: LumeCollectResult;
  state: LumeState;
}

/**
 * Pure reducer. `nowIso` on the `collect` action lets tests pin the
 * timestamp; in production the provider passes `new Date().toISOString()`.
 */
export function reduceLumeState(
  state: LumeState,
  action: LumeAction
): LumeReduceResult {
  switch (action.type) {
    case "collect":
      return collectSpecimen(state, action.payload, action.nowIso);
    case "setLang":
      return { state: { ...state, lang: action.payload } };
    case "setNickname":
      return { state: { ...state, nickname: action.payload } };
    case "setFinalSeen":
      return { state: { ...state, finalSeen: action.payload ?? true } };
    case "setCardSaved":
      return { state: { ...state, cardSaved: action.payload ?? true } };
    case "hydrate":
      return { state: action.payload };
    case "reset":
      return { state: INITIAL_LUME_STATE };
    default: {
      const _exhaustive: never = action;
      throw new Error(
        `unknown lume action: ${JSON.stringify(_exhaustive ?? null)}`
      );
    }
  }
}

function collectSpecimen(
  state: LumeState,
  payload: string,
  nowIso?: string
): LumeReduceResult {
  const slug = extractQrSlug(payload);
  if (!slug) {
    return { state, collectResult: "invalid" };
  }
  const specimen = LUME_SPECIMENS_BY_QR[slug];
  if (!specimen) {
    return { state, collectResult: "invalid" };
  }
  if (state.collected.includes(slug)) {
    return { state, collectResult: "dupe" };
  }
  const ts = nowIso ?? new Date().toISOString();
  return {
    state: {
      ...state,
      collected: [...state.collected, slug],
      collectedAt: { ...state.collectedAt, [specimen.number]: ts },
    },
    collectResult: "new",
    collectedSpecimen: specimen,
  };
}

/** Derived: visitor has reached 23/23. */
export function isComplete(state: LumeState): boolean {
  return state.collected.length >= LUME_TOTAL_SPECIMENS;
}

/** Derived: how many specimens have been collected. */
export function collectedCount(state: LumeState): number {
  return state.collected.length;
}

/**
 * Set of collected specimen numbers — the form the gallery and detail
 * screens want for membership checks.
 */
export function collectedNumbers(state: LumeState): Set<LumeSpecimenNumber> {
  const set = new Set<LumeSpecimenNumber>();
  for (const slug of state.collected) {
    const s = LUME_SPECIMENS_BY_QR[slug];
    if (s) {
      set.add(s.number);
    }
  }
  return set;
}

/**
 * Validate a parsed payload coming out of localStorage. Returns the value
 * unchanged if the shape matches the current `LUME_STATE_VERSION`; returns
 * `undefined` otherwise so callers can fall back to `INITIAL_LUME_STATE`.
 */
export function parsePersistedLumeState(raw: unknown): LumeState | undefined {
  if (!isPlainObject(raw)) {
    return;
  }
  if (raw.version !== LUME_STATE_VERSION) {
    return;
  }
  const candidate = raw.state;
  if (!isPlainObject(candidate)) {
    return;
  }
  const collected = candidate.collected;
  if (
    !Array.isArray(collected) ||
    collected.some((c) => typeof c !== "string")
  ) {
    return;
  }
  const collectedAt = candidate.collectedAt;
  if (!isPlainObject(collectedAt)) {
    return;
  }
  for (const value of Object.values(collectedAt)) {
    if (typeof value !== "string") {
      return;
    }
  }
  const lang = candidate.lang;
  if (typeof lang !== "string" || !LUME_LOCALES.includes(lang as LumeLocale)) {
    return;
  }
  const nickname = candidate.nickname;
  if (typeof nickname !== "string") {
    return;
  }
  const finalSeen = candidate.finalSeen;
  if (typeof finalSeen !== "boolean") {
    return;
  }
  const cardSaved = candidate.cardSaved;
  if (typeof cardSaved !== "boolean") {
    return;
  }
  return {
    collected: collected as readonly string[],
    collectedAt: collectedAt as Readonly<Record<number, string>>,
    lang: lang as LumeLocale,
    nickname,
    finalSeen,
    cardSaved,
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * The on-disk envelope for `LumeState`. Versioning the wrapper (rather
 * than scattering version checks across fields) keeps future migrations
 * to a single read site.
 */
export interface PersistedLumeState {
  state: LumeState;
  version: typeof LUME_STATE_VERSION;
}

/**
 * Read player state from a `Storage` instance (typically `window.localStorage`).
 * Designed to never throw — if the key is missing, the JSON is corrupt,
 * the schema version mismatched, or storage access is denied (private
 * browsing on iOS Safari), the function returns `INITIAL_LUME_STATE`.
 */
export function loadLumeState(storage: Storage | null): LumeState {
  if (!storage) {
    return INITIAL_LUME_STATE;
  }
  let raw: string | null;
  try {
    raw = storage.getItem(LUME_STATE_STORAGE_KEY);
  } catch {
    return INITIAL_LUME_STATE;
  }
  if (!raw) {
    return INITIAL_LUME_STATE;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return INITIAL_LUME_STATE;
  }
  return parsePersistedLumeState(parsed) ?? INITIAL_LUME_STATE;
}

/**
 * Whether `storage` currently holds a persisted Lume state envelope.
 *
 * Cheaper than `loadLumeState` (no JSON parse) and used by the provider
 * to distinguish a fresh first-time visitor (storage empty) from a
 * returning visitor whose persisted preferences must take precedence
 * over any client-side detection. Mirrors `loadLumeState`'s defensive
 * posture: storage errors and missing keys both report "no payload".
 */
export function hasPersistedLumeState(storage: Storage | null): boolean {
  if (!storage) {
    return false;
  }
  try {
    return storage.getItem(LUME_STATE_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

/**
 * Persist player state to a `Storage` instance. Wraps the state in the
 * versioned envelope and silently no-ops on storage errors so that a full
 * disk or denied access never crashes the UI.
 */
export function saveLumeState(storage: Storage | null, state: LumeState): void {
  if (!storage) {
    return;
  }
  const envelope: PersistedLumeState = {
    version: LUME_STATE_VERSION,
    state,
  };
  try {
    storage.setItem(LUME_STATE_STORAGE_KEY, JSON.stringify(envelope));
  } catch {
    // Quota exceeded or denied — nothing to do here.
  }
}

/** Convenience: wipe persisted state without touching unrelated keys. */
export function clearLumeState(storage: Storage | null): void {
  if (!storage) {
    return;
  }
  try {
    storage.removeItem(LUME_STATE_STORAGE_KEY);
  } catch {
    // ignore
  }
}
