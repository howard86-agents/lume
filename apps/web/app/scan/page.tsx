"use client";

import { LUME_TOTAL_SPECIMENS, type LumeSpecimen } from "@lume/data/specimens";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  type ReactElement,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocale, useLume } from "../../components/lume-provider";
import { ManualEntryDialog } from "../../components/scan/manual-entry-dialog";
import {
  DuplicateToast,
  InvalidToast,
  SuccessSheet,
} from "../../components/scan/scan-overlays";
import { useQrScanner } from "../../lib/use-qr-scanner";

/**
 * Scanner — `/scan`.
 *
 * This file owns the camera permission slice of the scan flow:
 *
 *   - request the rear-facing camera via getUserMedia,
 *   - render the live preview inside the circular scan frame on grant,
 *   - present recovery guidance + a Retry on denial,
 *   - present distinct, non-dead-end messaging for the no-camera and
 *     insecure-context (HTTPS required) cases that points the visitor
 *     to manual entry,
 *   - and clean up the MediaStream on unmount / route change so the
 *     hardware indicator goes off once the visitor leaves /scan.
 *
 * The QR decode loop and the collect-result UI live in #21 and #22; this
 * file intentionally exposes the live <video> stream + a manual-entry
 * link so those issues can layer on top without re-doing the camera
 * lifecycle.
 */

type ScanStatus =
  | "initial"
  | "starting"
  | "ready"
  | "denied"
  | "no-camera"
  | "insecure"
  | "unsupported"
  | "error";

function StartingPlaceholder({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-ink-3">
      <span
        aria-hidden="true"
        className="h-3 w-3 rounded-full bg-amber shadow-[0_0_16px_var(--lu-accent-amber)]"
        style={{ animation: "lume-pulse 1.4s ease-in-out infinite" }}
      />
      <span className="text-[13px] text-ink-2">{label}</span>
      <style>{`
        @keyframes lume-pulse { 0%, 100% { opacity: 0.4; transform: scale(0.85); } 50% { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}

function getInitialStatus(): ScanStatus {
  // SSR: defer the diagnosis to the client effect so the initial render is
  // identical on both sides.
  if (typeof window === "undefined") {
    return "initial";
  }
  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices ||
    typeof navigator.mediaDevices.getUserMedia !== "function"
  ) {
    return window.isSecureContext === false ? "insecure" : "unsupported";
  }
  if (window.isSecureContext === false) {
    return "insecure";
  }
  return "starting";
}

export default function ScanPage(): ReactElement {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[var(--lu-screen-h)] flex-col gap-6 bg-aurora-page p-[max(40px,env(safe-area-inset-top))_20px_max(40px,env(safe-area-inset-bottom))] text-ink">
          <div className="flex flex-1 items-center justify-center">
            <div className="relative aspect-square w-[min(78vw,360px)] overflow-hidden rounded-[50%] border border-rule-strong bg-glass-1 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_24px_60px_rgba(0,0,0,0.55)]" />
          </div>
        </main>
      }
    >
      <ScanPageInner />
    </Suspense>
  );
}

function ScanPageInner(): ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { format, t } = useLocale();
  const { collectWithSpecimen, collectedCount, hydrated } = useLume();
  const [status, setStatus] = useState<ScanStatus>("initial");
  const [activeOverlay, setActiveOverlay] = useState<
    | { kind: "success"; specimen: LumeSpecimen }
    | { kind: "dupe"; specimen?: LumeSpecimen }
    | { kind: "invalid" }
    | null
  >(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const processedDeepLinkRef = useRef<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastDecodeRef = useRef<{ payload: string; at: number } | null>(null);

  const handleDecode = useCallback(
    (payload: string) => {
      const now = Date.now();
      const lastDecode = lastDecodeRef.current;
      if (lastDecode?.payload === payload && now - lastDecode.at < 1500) {
        return;
      }
      lastDecodeRef.current = { payload, at: now };
      const { result, specimen } = collectWithSpecimen(payload);
      if (result === "new" && specimen) {
        setActiveOverlay({ kind: "success", specimen });
        return;
      }
      if (result === "dupe") {
        setActiveOverlay({ kind: "dupe", specimen });
        return;
      }
      setActiveOverlay({ kind: "invalid" });
    },
    [collectWithSpecimen]
  );

  // The decoder runs whenever the camera is ready AND no overlay is open
  // (so visitors are not bombarded by the same scan repeatedly while
  // they read the success sheet).
  useQrScanner({
    video: videoRef.current,
    enabled: status === "ready" && activeOverlay === null,
    onDecode: handleDecode,
  });

  // Auto-dismiss the dupe + invalid toasts after a short window so the
  // visitor never has to chase a stale toast off the screen.
  useEffect(() => {
    if (activeOverlay?.kind !== "dupe" && activeOverlay?.kind !== "invalid") {
      return;
    }
    const id = setTimeout(() => setActiveOverlay(null), 2400);
    return () => clearTimeout(id);
  }, [activeOverlay]);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setStatus("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {
          // Autoplay can fail; the visitor sees the same starting state and
          // can tap to retry. Not fatal.
        });
      }
      setStatus("ready");
      const e2ePayload =
        process.env.NODE_ENV === "production"
          ? undefined
          : (stream as { __lumeE2eQrPayload?: unknown }).__lumeE2eQrPayload;
      if (typeof e2ePayload === "string") {
        handleDecode(e2ePayload);
      }
    } catch (error) {
      const name = (error as { name?: string } | null)?.name;
      if (name === "NotAllowedError" || name === "SecurityError") {
        setStatus("denied");
        return;
      }
      if (name === "NotFoundError" || name === "OverconstrainedError") {
        setStatus("no-camera");
        return;
      }
      setStatus("error");
    }
  }, [handleDecode]);

  // Mount: diagnose environment then attempt to start the camera.
  // If the page was opened via a `?c=<code>` deep-link (e.g. from a
  // native camera scan), resolve the code immediately so the visitor
  // doesn't have to load the in-app camera just to confirm the same
  // payload they already aimed their phone at.
  useEffect(() => {
    if (!hydrated) {
      return;
    }
    const c = searchParams?.get("c");
    if (c && processedDeepLinkRef.current !== c) {
      processedDeepLinkRef.current = c;
      const { result, specimen } = collectWithSpecimen(c);
      if (result === "new" && specimen) {
        setActiveOverlay({ kind: "success", specimen });
      } else if (result === "dupe") {
        // Show the toast briefly then route to /collection so the visitor
        // sees their existing entry counted.
        setActiveOverlay({ kind: "dupe", specimen });
        setTimeout(() => router.replace("/collection"), 1200);
        return;
      } else {
        setActiveOverlay({ kind: "invalid" });
      }
      // For 'new', stay on /scan so the success sheet renders; the
      // visitor can tap View specimen or Continue scanning from there.
      // The success-sheet handles its own routing.
      // For 'invalid' deep-links, fall through to the usual camera flow
      // so the visitor can retry with the in-app camera.
    }
    const initial = getInitialStatus();
    if (initial === "starting") {
      startCamera().catch(() => {
        // startCamera already updates status on error; the catch here is
        // belt-and-braces for any synchronous throw from the call site.
      });
    } else {
      setStatus(initial);
    }
    return () => {
      stopStream();
    };
  }, [
    collectWithSpecimen,
    hydrated,
    router,
    searchParams,
    startCamera,
    stopStream,
  ]);

  const onRetry = () => {
    startCamera().catch(() => {
      // see above
    });
  };

  const showVideo = status === "starting" || status === "ready";
  const recovery = renderRecovery(status, t);

  return (
    <main className="flex min-h-[var(--lu-screen-h)] flex-col gap-6 bg-aurora-page p-[max(40px,env(safe-area-inset-top))_20px_max(40px,env(safe-area-inset-bottom))] text-ink">
      <header className="flex items-center justify-between">
        <Link className="text-ink-2 text-sm no-underline" href="/collection">
          ← {t.scan_back_to_index}
        </Link>
        <span className="font-mono-lu text-[11px] text-ink-2 uppercase tracking-[3px]">
          {t.scan_scanning}
        </span>
        <span className="min-w-16 rounded-full border border-[rgba(255,183,85,0.45)] bg-[rgba(255,183,85,0.10)] px-2.5 py-[7px] text-center font-mono-lu text-[11px] text-amber tracking-[1.3px] shadow-[0_0_22px_rgba(255,183,85,0.22)]">
          {format("index_progress", {
            found: collectedCount,
            total: LUME_TOTAL_SPECIMENS,
          })}
        </span>
      </header>

      <section className="flex flex-1 items-center justify-center">
        <div className="relative aspect-square w-[min(78vw,360px)] overflow-hidden rounded-[50%] border border-rule-strong bg-glass-1 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_24px_60px_rgba(0,0,0,0.55)]">
          {showVideo ? (
            <>
              {/* No horizontal mirror: this flow uses the rear (environment)
                  camera, a see-through view. Flipping it would reverse the
                  visitor's framing. Mirroring is only correct for front cameras. */}
              <video
                autoPlay
                className="block h-full w-full bg-deep object-cover"
                muted
                playsInline
                ref={videoRef}
              >
                <track kind="captions" />
              </video>
              {status === "starting" ? (
                <StartingPlaceholder label={t.permission_title} />
              ) : null}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[50%] border-2 border-glass-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
              />
            </>
          ) : null}
          {!showVideo && recovery ? (
            <div className="absolute inset-[auto] mx-auto flex max-w-[420px] flex-col items-center gap-3 rounded-[20px] border border-rule-hair bg-glass-1 p-[24px_20px] text-center">
              {recovery.body}
              {recovery.actions ? (
                <div className="flex flex-wrap justify-center gap-3">
                  {status === "denied" || status === "error" ? (
                    <button
                      className="cursor-pointer appearance-none rounded-full border border-rule-strong bg-glass-3 px-6 py-3 font-semibold text-ink text-sm"
                      onClick={onRetry}
                      type="button"
                    >
                      {t.permission_retry}
                    </button>
                  ) : null}
                  <Link
                    className="cursor-pointer appearance-none self-center rounded-full border border-rule-strong bg-transparent px-5 py-3 font-medium text-ink text-sm no-underline"
                    href="/collection"
                  >
                    {t.scan_back_to_index}
                  </Link>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      {recovery ? null : (
        <p className="m-0 text-center text-ink-2 text-sm">
          {showVideo ? t.scan_helper : helperForStatus(status, t)}
        </p>
      )}

      <button
        className="cursor-pointer appearance-none self-center rounded-full border border-rule-strong bg-transparent px-5 py-3 font-medium text-ink text-sm no-underline"
        onClick={() => setManualOpen(true)}
        type="button"
      >
        {t.scan_manual_open}
      </button>

      {manualOpen ? (
        <ManualEntryDialog
          input={manualInput}
          onCancel={() => {
            setManualOpen(false);
            setManualInput("");
          }}
          onChange={setManualInput}
          onSubmit={(payload) => {
            const { result, specimen } = collectWithSpecimen(payload);
            setManualOpen(false);
            setManualInput("");
            if (result === "new" && specimen) {
              setActiveOverlay({ kind: "success", specimen });
            } else if (result === "dupe") {
              setActiveOverlay({ kind: "dupe", specimen });
            } else {
              setActiveOverlay({ kind: "invalid" });
            }
          }}
        />
      ) : null}

      {activeOverlay?.kind === "success" ? (
        <SuccessSheet
          collectedCount={collectedCount}
          onContinue={() => setActiveOverlay(null)}
          specimen={activeOverlay.specimen}
        />
      ) : null}
      {activeOverlay?.kind === "dupe" ? (
        <DuplicateToast
          onDismiss={() => setActiveOverlay(null)}
          specimen={activeOverlay.specimen}
        />
      ) : null}
      {activeOverlay?.kind === "invalid" ? (
        <InvalidToast onDismiss={() => setActiveOverlay(null)} />
      ) : null}
    </main>
  );
}

interface RecoveryContent {
  /** Whether to render the actions row. */
  actions: boolean;
  /** Title element. */
  body: ReactElement;
}

function renderRecovery(
  status: ScanStatus,
  t: ReturnType<typeof useLocale>["t"]
): RecoveryContent | null {
  switch (status) {
    case "denied":
      return {
        body: (
          <>
            <h2 className="m-0 font-semibold text-xl">
              {t.permission_denied_title}
            </h2>
            <p className="m-0 text-ink-2 text-sm leading-normal">
              {t.permission_denied_body}
            </p>
          </>
        ),
        actions: true,
      };
    case "no-camera":
      return {
        body: (
          <>
            <h2 className="m-0 font-semibold text-xl">
              {t.permission_no_camera_title}
            </h2>
            <p className="m-0 text-ink-2 text-sm leading-normal">
              {t.permission_no_camera_body}
            </p>
          </>
        ),
        actions: true,
      };
    case "insecure":
      return {
        body: (
          <>
            <h2 className="m-0 font-semibold text-xl">
              {t.permission_insecure_title}
            </h2>
            <p className="m-0 text-ink-2 text-sm leading-normal">
              {t.permission_insecure_body}
            </p>
          </>
        ),
        actions: true,
      };
    case "unsupported":
      return {
        body: (
          <>
            <h2 className="m-0 font-semibold text-xl">
              {t.permission_no_camera_title}
            </h2>
            <p className="m-0 text-ink-2 text-sm leading-normal">
              {t.permission_no_camera_body}
            </p>
          </>
        ),
        actions: true,
      };
    case "error":
      return {
        body: (
          <>
            <h2 className="m-0 font-semibold text-xl">
              {t.permission_denied_title}
            </h2>
            <p className="m-0 text-ink-2 text-sm leading-normal">
              {t.permission_denied_body}
            </p>
          </>
        ),
        actions: true,
      };
    default:
      return null;
  }
}

function helperForStatus(
  status: ScanStatus,
  t: ReturnType<typeof useLocale>["t"]
): string {
  switch (status) {
    case "denied":
    case "error":
      return t.permission_denied_body;
    case "no-camera":
    case "unsupported":
      return t.permission_no_camera_body;
    case "insecure":
      return t.permission_insecure_body;
    default:
      return t.scan_helper;
  }
}
