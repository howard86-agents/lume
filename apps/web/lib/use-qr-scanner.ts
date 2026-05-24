"use client";

import { BarcodeDetector, prepareZXingModule } from "barcode-detector/ponyfill";
import { useEffect, useRef } from "react";

/**
 * useQrScanner — sample a `<video>` stream for QR codes in a throttled
 * loop, hand each decoded payload to a callback, and stop the loop on
 * unmount or when `enabled` flips to false.
 *
 * The hook keeps the scanning loop itself out of /scan/page.tsx so the
 * camera lifecycle stays the only concern there. Frame sampling uses an
 * offscreen canvas tuned to a fixed sample size (the scanner does not
 * need full-resolution frames, and a 480×480 sample is large enough for
 * a 23-codes catalogue while keeping CPU usage tame on low-end phones).
 *
 * Decode cadence is throttled to roughly five frames per second so the
 * battery does not melt while the visitor lines up the marker, and the
 * loop pauses for a configurable cooldown after each successful decode
 * to avoid surfacing the same payload a dozen times in a row.
 *
 * Internally uses ZXing-C++ (via barcode-detector ponyfill) compiled to
 * WASM for robust detection of rotated, low-contrast, and damaged QR
 * codes under variable gallery lighting.
 */

// ---------------------------------------------------------------------------
// WASM pre-warm: configure self-hosted path and trigger download immediately
// so the first scan attempt doesn't stall on a cold WASM instantiation.
// ---------------------------------------------------------------------------
if (typeof window !== "undefined") {
  prepareZXingModule({
    overrides: {
      locateFile: (path: string, prefix: string) => {
        if (path.endsWith(".wasm")) {
          return `/wasm/${path}`;
        }
        return prefix + path;
      },
    },
    fireImmediately: true,
  });
}

// Singleton detector — one instance is reused across hook mounts.
const detector = new BarcodeDetector({ formats: ["qr_code"] });

export interface UseQrScannerOptions {
  /** Minimum interval between successful decode handoffs in ms. Default: 1500. */
  cooldownMs?: number;
  /** Whether the loop should run; flip false to stop the scan. */
  enabled: boolean;
  /** Minimum interval between frame samples in ms. Default: 200. */
  intervalMs?: number;
  /** Called for every successfully-decoded raw payload. */
  onDecode: (payload: string) => void;
  /** Sample square edge length in CSS pixels. Default: 480. */
  sampleSize?: number;
  /** The video element to sample. */
  video: HTMLVideoElement | null;
}

const DEFAULT_INTERVAL_MS = 200;
const DEFAULT_COOLDOWN_MS = 1500;
const DEFAULT_SAMPLE_SIZE = 480;

export function useQrScanner({
  video,
  enabled,
  onDecode,
  intervalMs = DEFAULT_INTERVAL_MS,
  cooldownMs = DEFAULT_COOLDOWN_MS,
  sampleSize = DEFAULT_SAMPLE_SIZE,
}: UseQrScannerOptions): void {
  const onDecodeRef = useRef(onDecode);
  onDecodeRef.current = onDecode;

  useEffect(() => {
    if (!(enabled && video)) {
      return;
    }
    if (typeof document === "undefined") {
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      return;
    }
    canvas.width = sampleSize;
    canvas.height = sampleSize;

    let cancelled = false;
    let lastSampleAt = 0;
    let cooldownUntil = 0;
    let decoding = false;
    let rafId: number | null = null;

    const tick = (now: number) => {
      if (cancelled) {
        return;
      }
      // Skip frames while a decode is in-flight, the throttle interval
      // hasn't elapsed, or we are in the post-decode cooldown window.
      if (decoding || now - lastSampleAt < intervalMs || now < cooldownUntil) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      lastSampleAt = now;

      if (
        video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
        video.videoWidth > 0 &&
        video.videoHeight > 0
      ) {
        // Center-crop the video frame into the square sample canvas so
        // the detector sees the same area the scan-frame UI shows.
        const vw = video.videoWidth;
        const vh = video.videoHeight;
        const side = Math.min(vw, vh);
        const sx = (vw - side) / 2;
        const sy = (vh - side) / 2;
        try {
          ctx.drawImage(
            video,
            sx,
            sy,
            side,
            side,
            0,
            0,
            sampleSize,
            sampleSize
          );
          const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
          decoding = true;
          detector
            .detect(imageData)
            .then((results) => {
              decoding = false;
              if (cancelled) {
                return;
              }
              if (results.length > 0) {
                cooldownUntil = performance.now() + cooldownMs;
                onDecodeRef.current(results[0].rawValue);
              }
            })
            .catch(() => {
              decoding = false;
            });
        } catch {
          // A transient draw error (e.g. video not yet committed a
          // frame after a track change) is safe to ignore — the next
          // tick will retry.
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [video, enabled, intervalMs, cooldownMs, sampleSize]);
}
