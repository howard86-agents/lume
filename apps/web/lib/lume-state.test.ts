import { describe, expect, test } from "bun:test";
import { LUME_SPECIMENS } from "@lume/data/specimens";
import {
  clearLumeState,
  collectedCount,
  collectedNumbers,
  INITIAL_LUME_STATE,
  isComplete,
  LUME_STATE_STORAGE_KEY,
  LUME_STATE_VERSION,
  loadLumeState,
  parsePersistedLumeState,
  reduceLumeState,
  saveLumeState,
} from "./lume-state";

class MemoryStorage implements Storage {
  private readonly store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear() {
    this.store.clear();
  }
  getItem(key: string) {
    return this.store.get(key) ?? null;
  }
  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null;
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
}

describe("reduceLumeState", () => {
  test("collect adds a new specimen and returns 'new'", () => {
    const slug = LUME_SPECIMENS[0].qr;
    const result = reduceLumeState(INITIAL_LUME_STATE, {
      type: "collect",
      payload: slug,
      nowIso: "2026-05-22T00:00:00.000Z",
    });
    expect(result.collectResult).toBe("new");
    expect(result.collectedSpecimen?.qr).toBe(slug);
    expect(result.state.collected).toEqual([slug]);
    expect(result.state.collectedAt[LUME_SPECIMENS[0].number]).toBe(
      "2026-05-22T00:00:00.000Z"
    );
  });

  test("collect on an already-collected slug returns 'dupe'", () => {
    const slug = LUME_SPECIMENS[0].qr;
    const once = reduceLumeState(INITIAL_LUME_STATE, {
      type: "collect",
      payload: slug,
      nowIso: "2026-05-22T00:00:00.000Z",
    });
    const twice = reduceLumeState(once.state, {
      type: "collect",
      payload: slug,
      nowIso: "2026-05-22T00:30:00.000Z",
    });
    expect(twice.collectResult).toBe("dupe");
    expect(twice.state).toBe(once.state);
  });

  test("collect on an unknown payload returns 'invalid'", () => {
    const result = reduceLumeState(INITIAL_LUME_STATE, {
      type: "collect",
      payload: "lu-99-unknown",
    });
    expect(result.collectResult).toBe("invalid");
    expect(result.state).toBe(INITIAL_LUME_STATE);
  });

  test("collect resolves the c= param of a full URL", () => {
    const slug = LUME_SPECIMENS[3].qr;
    const result = reduceLumeState(INITIAL_LUME_STATE, {
      type: "collect",
      payload: `https://lume.example/scan?c=${slug}`,
    });
    expect(result.collectResult).toBe("new");
    expect(result.state.collected[0]).toBe(slug);
  });

  test("setLang updates language", () => {
    const result = reduceLumeState(INITIAL_LUME_STATE, {
      type: "setLang",
      payload: "ja",
    });
    expect(result.state.lang).toBe("ja");
  });

  test("setNickname updates nickname", () => {
    const result = reduceLumeState(INITIAL_LUME_STATE, {
      type: "setNickname",
      payload: "Howard",
    });
    expect(result.state.nickname).toBe("Howard");
  });

  test("setFinalSeen and setCardSaved default to true", () => {
    const a = reduceLumeState(INITIAL_LUME_STATE, { type: "setFinalSeen" });
    expect(a.state.finalSeen).toBe(true);
    const b = reduceLumeState(INITIAL_LUME_STATE, { type: "setCardSaved" });
    expect(b.state.cardSaved).toBe(true);
  });

  test("reset returns INITIAL_LUME_STATE", () => {
    const populated = reduceLumeState(INITIAL_LUME_STATE, {
      type: "collect",
      payload: LUME_SPECIMENS[0].qr,
    }).state;
    const reset = reduceLumeState(populated, { type: "reset" });
    expect(reset.state).toEqual(INITIAL_LUME_STATE);
  });
});

describe("derivations", () => {
  test("isComplete is true at 23/23", () => {
    let state = INITIAL_LUME_STATE;
    for (const s of LUME_SPECIMENS) {
      state = reduceLumeState(state, {
        type: "collect",
        payload: s.qr,
      }).state;
    }
    expect(isComplete(state)).toBe(true);
    expect(collectedCount(state)).toBe(23);
    const nums = collectedNumbers(state);
    expect(nums.size).toBe(23);
  });

  test("isComplete is false below 23", () => {
    const state = reduceLumeState(INITIAL_LUME_STATE, {
      type: "collect",
      payload: LUME_SPECIMENS[0].qr,
    }).state;
    expect(isComplete(state)).toBe(false);
    expect(collectedCount(state)).toBe(1);
  });
});

describe("persistence", () => {
  test("save then load round-trips the state", () => {
    const storage = new MemoryStorage();
    const state = reduceLumeState(INITIAL_LUME_STATE, {
      type: "collect",
      payload: LUME_SPECIMENS[5].qr,
      nowIso: "2026-05-22T00:00:00.000Z",
    }).state;
    saveLumeState(storage, state);
    const loaded = loadLumeState(storage);
    expect(loaded).toEqual(state);
  });

  test("load returns INITIAL_LUME_STATE when storage is empty", () => {
    const storage = new MemoryStorage();
    expect(loadLumeState(storage)).toEqual(INITIAL_LUME_STATE);
  });

  test("load returns INITIAL_LUME_STATE on corrupt JSON", () => {
    const storage = new MemoryStorage();
    storage.setItem(LUME_STATE_STORAGE_KEY, "not json");
    expect(loadLumeState(storage)).toEqual(INITIAL_LUME_STATE);
  });

  test("load returns INITIAL_LUME_STATE on version mismatch", () => {
    const storage = new MemoryStorage();
    storage.setItem(
      LUME_STATE_STORAGE_KEY,
      JSON.stringify({
        version: LUME_STATE_VERSION + 1,
        state: INITIAL_LUME_STATE,
      })
    );
    expect(loadLumeState(storage)).toEqual(INITIAL_LUME_STATE);
  });

  test("load returns INITIAL_LUME_STATE when storage is null (SSR)", () => {
    expect(loadLumeState(null)).toEqual(INITIAL_LUME_STATE);
  });

  test("clear removes only the lume key", () => {
    const storage = new MemoryStorage();
    storage.setItem("other", "x");
    saveLumeState(storage, INITIAL_LUME_STATE);
    clearLumeState(storage);
    expect(storage.getItem(LUME_STATE_STORAGE_KEY)).toBeNull();
    expect(storage.getItem("other")).toBe("x");
  });

  test("parsePersistedLumeState rejects malformed payloads", () => {
    expect(parsePersistedLumeState(null)).toBeUndefined();
    expect(parsePersistedLumeState("string")).toBeUndefined();
    expect(parsePersistedLumeState({})).toBeUndefined();
    expect(
      parsePersistedLumeState({ version: 1, state: { collected: 5 } })
    ).toBeUndefined();
    expect(
      parsePersistedLumeState({
        version: 1,
        state: {
          collected: [],
          collectedAt: {},
          lang: "fr",
          nickname: "",
          finalSeen: false,
          cardSaved: false,
        },
      })
    ).toBeUndefined();
  });

  test("save no-ops when storage throws", () => {
    const storage = {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota");
      },
      removeItem: () => {
        // ignored
      },
      clear: () => {
        // ignored
      },
      key: () => null,
      length: 0,
    } satisfies Storage;
    expect(() => saveLumeState(storage, INITIAL_LUME_STATE)).not.toThrow();
  });
});
