/**
 * Save the achievement-card DOM as a PNG.
 *
 * The orchestration is intentionally pure of React state so the `/card`
 * page can drive it from a single click handler. The flow is:
 *
 *   1. Wait for `document.fonts.ready` so CJK glyphs render before we
 *      rasterise — without this the snapshot can land before the Noto
 *      family has resolved and capture fallback Latin shapes.
 *   2. Snapshot the node with `modern-screenshot/domToPng` at 2x scale,
 *      so the resulting image is sharp on retina displays.
 *   3. Try `navigator.canShare({ files })` + `navigator.share` first
 *      (the iOS / Android system share-sheet experience the brief asks
 *      for); otherwise fall back to a synthesised `<a download>` click.
 *
 * Returns an outcome enum so the caller can branch on share vs download
 * and decide whether to navigate to `/saved`.
 */

import { domToPng } from "modern-screenshot";

/** Possible outcomes of a save attempt. */
export type SaveCardOutcome =
  | { kind: "shared" }
  | { kind: "downloaded" }
  /** User dismissed the share sheet (`AbortError`). */
  | { kind: "share-cancelled" }
  | { kind: "error"; reason: string };

/** Inputs to the save helper. */
export interface SaveCardOptions {
  /** Filename used for the share file + download fallback. */
  fileName?: string;
  /**
   * Logical pixel scale handed to `modern-screenshot`. Defaults to `2`
   * so the captured PNG is sharp on retina mobile displays.
   */
  scale?: number;
}

/** Default file name when the caller does not override it. */
export const DEFAULT_CARD_FILE_NAME = "lume-field-guide.png";

/**
 * Wait for fonts to settle before snapshotting. Falls back to a no-op
 * resolved promise on browsers without the FontFaceSet API.
 */
async function waitForFonts(): Promise<void> {
  if (typeof document === "undefined") {
    return;
  }
  // FontFaceSet is broadly supported on mobile browsers (Safari, Chrome
  // Android, Firefox) — but we still guard the access to keep Node /
  // SSR safe.
  const ready = document.fonts?.ready;
  if (ready) {
    try {
      await ready;
    } catch {
      // Some browsers reject when fonts fail to load; that is still safe
      // to capture against (the system fallback will render).
    }
  }
}

/**
 * Convert a `data:image/png;base64,...` URL into a `File`. Used for the
 * Web Share fallback when the browser only exposes `navigator.share`.
 */
async function dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], fileName, { type: blob.type || "image/png" });
}

/**
 * Trigger a synthesised download anchor for the supplied PNG data URL.
 * The anchor is appended/removed inside the same tick so it never shows
 * up in the DOM tree.
 */
function triggerDownload(dataUrl: string, fileName: string): void {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = fileName;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

/**
 * Test whether the browser can share `files` via the Web Share API. The
 * presence of `navigator.share` alone is insufficient — desktop Chrome
 * exposes it but rejects file payloads.
 */
function canShareFile(file: File): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }
  // `navigator.canShare` is the contract; without it we cannot trust
  // `share()` will accept files.
  if (typeof navigator.canShare !== "function") {
    return false;
  }
  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

/**
 * Snapshot `node` and either share or download the resulting PNG. The
 * function never throws — every failure mode returns a `SaveCardOutcome`
 * so the UI can render an inline message instead of an unhandled error.
 */
export async function saveAchievementCard(
  node: HTMLElement,
  options: SaveCardOptions = {}
): Promise<SaveCardOutcome> {
  const { scale = 2, fileName = DEFAULT_CARD_FILE_NAME } = options;
  try {
    await waitForFonts();
    const dataUrl = await domToPng(node, {
      scale,
      // The card surface is already opaque; modern-screenshot defaults
      // to a transparent background otherwise.
      backgroundColor: "#08080d",
    });
    const file = await dataUrlToFile(dataUrl, fileName);
    if (canShareFile(file) && typeof navigator.share === "function") {
      try {
        await navigator.share({ files: [file] });
        return { kind: "shared" };
      } catch (error) {
        // The user dismissing the share-sheet is not an error worth
        // surfacing — they may want to try the download path next.
        if (error instanceof DOMException && error.name === "AbortError") {
          return { kind: "share-cancelled" };
        }
        // Fall through to the download path on any other share error.
      }
    }
    triggerDownload(dataUrl, fileName);
    return { kind: "downloaded" };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return { kind: "error", reason };
  }
}
