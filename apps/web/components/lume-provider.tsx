"use client";

import {
  getLumeLocale,
  type LocaleKey,
  LUME_LOCALE_BUNDLES,
  type LumeLocale,
  type LumeLocaleBundle,
  resolveBrowserLocale,
} from "@lume/data/locales";
import type { LumeSpecimen, LumeSpecimenNumber } from "@lume/data/specimens";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  collectedCount,
  collectedNumbers,
  hasPersistedLumeState,
  INITIAL_LUME_STATE,
  isComplete,
  type LumeAction,
  type LumeCollectResult,
  type LumeReduceResult,
  type LumeState,
  loadLumeState,
  reduceLumeState,
  saveLumeState,
} from "../lib/lume-state";

/**
 * Public surface a screen sees through `useLume()`. Actions are the
 * minimum set the issue spec requires plus the two completion-flag
 * setters needed by `/complete` and `/saved`.
 */
export interface LumeContextValue {
  /**
   * Resolve a payload (a bare QR slug or a full `?c=` URL) against the
   * catalogue. Returns the outcome the scan-result overlays consume.
   */
  collect: (payload: string) => LumeCollectResult;
  /** Number of collected specimens (`state.collected.length`). */
  collectedCount: number;
  /** Set of collected specimen numbers — handy for membership checks. */
  collectedNumbers: ReadonlySet<LumeSpecimenNumber>;
  /**
   * Same as `collect` but additionally returns the resolved specimen on
   * `'new'` and `'dupe'` outcomes so scan-result feedback can render it
   * without re-querying the catalogue.
   */
  collectWithSpecimen: (payload: string) => {
    result: LumeCollectResult;
    specimen?: LumeSpecimen;
  };
  /** Whether the visitor has reached 23/23. */
  completion: boolean;
  /**
   * `true` once the persisted payload has been read on the client. Until
   * this flips, `state` is the initial blank state — any UI that depends
   * on collected/lang should defer rendering to avoid an SSR/CSR flash.
   */
  hydrated: boolean;
  /** Mark the achievement card as saved. */
  markCardSaved: () => void;
  /** Mark the 23/23 reveal as seen. */
  markFinalSeen: () => void;
  /** Wipe persisted state and return to a fresh visitor. */
  reset: () => void;
  /** Persist a new active language. */
  setLang: (lang: LumeLocale) => void;
  /** Persist a new card nickname. */
  setNickname: (nickname: string) => void;
  /** Current player state (already reflects any persisted payload). */
  state: LumeState;
}

const LumeContext = createContext<LumeContextValue | null>(null);

/**
 * Read the visitor's language preferences from the browser. Prefers the
 * full ordered list (`navigator.languages`) and falls back to the single
 * `navigator.language`. Returns an empty array in non-browser contexts so
 * `resolveBrowserLocale` falls back to its default.
 */
function getNavigatorLocales(): readonly string[] {
  if (typeof navigator === "undefined") {
    return [];
  }
  const list = navigator.languages;
  if (Array.isArray(list) && list.length > 0) {
    return list;
  }
  const single = navigator.language;
  return single ? [single] : [];
}

/**
 * What `useLocale()` returns — the active locale code, the fully-resolved
 * string bundle, the language setter, and a small `t(key, vars)` helper
 * for the few strings that interpolate.
 */
export interface LumeLocaleContextValue {
  /**
   * Format a string from the bundle, interpolating `{key}` placeholders
   * with the supplied vars. Vars that are not present in the template are
   * silently ignored; missing template vars are left as `{key}`.
   */
  format: (key: LocaleKey, vars?: Record<string, string | number>) => string;
  /** Active locale code. */
  lang: LumeLocale;
  /** Persist a new active language. */
  setLang: (lang: LumeLocale) => void;
  /** Resolved bundle for the active locale. */
  t: LumeLocaleBundle;
}

interface LumeProviderProps {
  children: ReactNode;
  /** Optional initial state — primarily for tests/storybook. */
  initialState?: LumeState;
}

export function LumeProvider({
  children,
  initialState,
}: LumeProviderProps): ReactNode {
  // The reducer wrapper unwraps `LumeReduceResult` into pure state for
  // useReducer (which expects state-only). The latest collect outcome is
  // captured in a ref so `collect()` can return it synchronously to the
  // caller without round-tripping through React state.
  const lastResultRef = useRef<LumeReduceResult | undefined>(undefined);
  const [state, dispatch] = useReducer(
    (current: LumeState, action: LumeAction): LumeState => {
      const result = reduceLumeState(current, action);
      lastResultRef.current = result;
      return result.state;
    },
    initialState ?? INITIAL_LUME_STATE
  );

  // Hydrate from localStorage exactly once, after mount, to avoid an
  // SSR/CSR mismatch on the first paint. On a brand-new visit (no
  // persisted payload) seed `lang` from the closest supported browser
  // locale so the cover/picker render in the visitor's language; a
  // returning visitor's persisted preference always wins.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (initialState) {
      setHydrated(true);
      return;
    }
    if (typeof window === "undefined") {
      return;
    }
    const storage = window.localStorage;
    const persisted = loadLumeState(storage);
    const next = hasPersistedLumeState(storage)
      ? persisted
      : { ...persisted, lang: resolveBrowserLocale(getNavigatorLocales()) };
    dispatch({ type: "hydrate", payload: next });
    setHydrated(true);
  }, [initialState]);

  // Persist whenever state changes — but only after the first hydration
  // tick, otherwise we would write the blank initial state over a real
  // payload before `loadLumeState` had a chance to read it back.
  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (typeof window === "undefined") {
      return;
    }
    saveLumeState(window.localStorage, state);
  }, [hydrated, state]);

  const stateRef = useRef(state);
  stateRef.current = state;

  const collect = useCallback((payload: string): LumeCollectResult => {
    const nowIso = new Date().toISOString();
    const result = reduceLumeState(stateRef.current, {
      type: "collect",
      payload,
      nowIso,
    });
    lastResultRef.current = result;
    dispatch({ type: "collect", payload, nowIso });
    return result.collectResult ?? "invalid";
  }, []);

  const collectWithSpecimen = useCallback(
    (
      payload: string
    ): { result: LumeCollectResult; specimen?: LumeSpecimen } => {
      const nowIso = new Date().toISOString();
      const result = reduceLumeState(stateRef.current, {
        type: "collect",
        payload,
        nowIso,
      });
      lastResultRef.current = result;
      dispatch({ type: "collect", payload, nowIso });
      return {
        result: result.collectResult ?? "invalid",
        specimen: result.collectedSpecimen,
      };
    },
    []
  );

  const setLang = useCallback((lang: LumeLocale) => {
    dispatch({ type: "setLang", payload: lang });
  }, []);

  const setNickname = useCallback((nickname: string) => {
    dispatch({ type: "setNickname", payload: nickname });
  }, []);

  const markFinalSeen = useCallback(() => {
    dispatch({ type: "setFinalSeen", payload: true });
  }, []);

  const markCardSaved = useCallback(() => {
    dispatch({ type: "setCardSaved", payload: true });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "reset" });
  }, []);

  const value = useMemo<LumeContextValue>(
    () => ({
      state,
      hydrated,
      collectedCount: collectedCount(state),
      collectedNumbers: collectedNumbers(state),
      completion: isComplete(state),
      collect,
      collectWithSpecimen,
      setLang,
      setNickname,
      markFinalSeen,
      markCardSaved,
      reset,
    }),
    [
      state,
      hydrated,
      collect,
      collectWithSpecimen,
      setLang,
      setNickname,
      markFinalSeen,
      markCardSaved,
      reset,
    ]
  );

  return <LumeContext.Provider value={value}>{children}</LumeContext.Provider>;
}

/**
 * Read the full Lume player-state surface. Throws if used outside a
 * `LumeProvider` — every screen in the visitor flow is mounted inside
 * the root provider, so this guard catches misuse early.
 */
export function useLume(): LumeContextValue {
  const value = useContext(LumeContext);
  if (!value) {
    throw new Error("useLume must be used inside a <LumeProvider>");
  }
  return value;
}

const FORMAT_TOKEN = /\{(\w+)\}/g;

/**
 * Convenience hook that returns just the active-locale slice of the
 * provider — enough for any screen that only needs to read text and
 * (optionally) change the language.
 */
export function useLocale(): LumeLocaleContextValue {
  const { state, setLang } = useLume();
  return useMemo<LumeLocaleContextValue>(() => {
    const bundle = LUME_LOCALE_BUNDLES[state.lang] ?? getLumeLocale(state.lang);
    const format = (
      key: LocaleKey,
      vars?: Record<string, string | number>
    ): string => {
      const template = bundle[key];
      if (!vars) {
        return template;
      }
      return template.replace(FORMAT_TOKEN, (match, name: string) => {
        const replacement = vars[name];
        return replacement === undefined ? match : String(replacement);
      });
    };
    return {
      lang: state.lang,
      t: bundle,
      setLang,
      format,
    };
  }, [state.lang, setLang]);
}
