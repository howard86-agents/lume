"use client";

import { LUME_TOTAL_SPECIMENS, type LumeSpecimen } from "@lume/data/specimens";
import { LU } from "@lume/data/tokens";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  type CSSProperties,
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

const PAGE_STYLE: CSSProperties = {
  minHeight: "100dvh",
  background: LU.aurora.page,
  color: LU.base.ink,
  display: "flex",
  flexDirection: "column",
  padding:
    "max(40px, env(safe-area-inset-top)) 20px max(40px, env(safe-area-inset-bottom))",
  gap: 24,
};

const HEADER_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const BACK_LINK_STYLE: CSSProperties = {
  color: LU.base.ink2,
  textDecoration: "none",
  fontSize: 14,
};

const TITLE_STYLE: CSSProperties = {
  fontFamily: "var(--lu-font-mono)",
  fontSize: 11,
  letterSpacing: 3,
  textTransform: "uppercase",
  color: LU.base.ink2,
};

const PROGRESS_CHIP_STYLE: CSSProperties = {
  minWidth: 64,
  padding: "7px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255, 183, 85, 0.45)",
  background: "rgba(255, 183, 85, 0.10)",
  boxShadow: "0 0 22px rgba(255, 183, 85, 0.22)",
  color: LU.accent.amber,
  fontFamily: "var(--lu-font-mono)",
  fontSize: 11,
  letterSpacing: 1.3,
  textAlign: "center",
};

const FRAME_WRAPPER_STYLE: CSSProperties = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const FRAME_STYLE: CSSProperties = {
  position: "relative",
  width: "min(78vw, 360px)",
  aspectRatio: "1 / 1",
  borderRadius: "50%",
  overflow: "hidden",
  border: `1px solid ${LU.rule.strong}`,
  boxShadow:
    "0 0 0 1px rgba(255, 255, 255, 0.08), 0 24px 60px rgba(0,0,0,0.55)",
  background: LU.glass.surface1,
};

const VIDEO_STYLE: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  background: LU.base.deep,
  display: "block",
  transform: "scaleX(-1)" /* mirror for natural framing on phones */,
};

const FRAME_OVERLAY_STYLE: CSSProperties = {
  position: "absolute",
  inset: 0,
  borderRadius: "50%",
  border: `2px solid ${LU.glass.surface3}`,
  pointerEvents: "none",
  boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.06)",
};

const HELPER_STYLE: CSSProperties = {
  textAlign: "center",
  color: LU.base.ink2,
  fontSize: 14,
  margin: 0,
};

const MANUAL_LINK_STYLE: CSSProperties = {
  appearance: "none",
  background: "transparent",
  color: LU.base.ink,
  border: `1px solid ${LU.rule.strong}`,
  padding: "12px 20px",
  borderRadius: 999,
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
  alignSelf: "center",
  textDecoration: "none",
};

const RECOVERY_CARD_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
  padding: "24px 20px",
  borderRadius: 20,
  border: `1px solid ${LU.rule.hair}`,
  background: LU.glass.surface1,
  textAlign: "center",
  margin: "0 auto",
  maxWidth: 420,
};

const RECOVERY_TITLE_STYLE: CSSProperties = {
  fontSize: 20,
  fontWeight: 600,
  margin: 0,
};

const RECOVERY_BODY_STYLE: CSSProperties = {
  color: LU.base.ink2,
  fontSize: 14,
  lineHeight: 1.5,
  margin: 0,
};

const RETRY_STYLE: CSSProperties = {
  appearance: "none",
  background: LU.glass.surface3,
  color: LU.base.ink,
  border: `1px solid ${LU.rule.strong}`,
  padding: "12px 24px",
  borderRadius: 999,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

function StartingPlaceholder({ label }: { label: string }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        color: LU.base.ink3,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: LU.accent.amber,
          boxShadow: `0 0 16px ${LU.accent.amber}`,
          animation: "lume-pulse 1.4s ease-in-out infinite",
        }}
      />
      <span style={{ fontSize: 13, color: LU.base.ink2 }}>{label}</span>
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
        <main style={PAGE_STYLE}>
          <div style={FRAME_WRAPPER_STYLE}>
            <div style={FRAME_STYLE} />
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
        // Show the toast briefly then route to /index so the visitor
        // sees their existing entry counted.
        setActiveOverlay({ kind: "dupe", specimen });
        setTimeout(() => router.replace("/index"), 1200);
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
    <main style={PAGE_STYLE}>
      <header style={HEADER_STYLE}>
        <Link href="/index" style={BACK_LINK_STYLE}>
          ← {t.scan_back_to_index}
        </Link>
        <span style={TITLE_STYLE}>{t.scan_scanning}</span>
        <span style={PROGRESS_CHIP_STYLE}>
          {format("index_progress", {
            found: collectedCount,
            total: LUME_TOTAL_SPECIMENS,
          })}
        </span>
      </header>

      <section style={FRAME_WRAPPER_STYLE}>
        <div style={FRAME_STYLE}>
          {showVideo ? (
            <>
              <video
                autoPlay
                muted
                playsInline
                ref={videoRef}
                style={VIDEO_STYLE}
              >
                <track kind="captions" />
              </video>
              {status === "starting" ? (
                <StartingPlaceholder label={t.permission_title} />
              ) : null}
              <div aria-hidden="true" style={FRAME_OVERLAY_STYLE} />
            </>
          ) : null}
          {!showVideo && recovery ? (
            <div
              style={{
                ...RECOVERY_CARD_STYLE,
                position: "absolute",
                inset: "auto",
              }}
            >
              {recovery.body}
              {recovery.actions ? (
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  {status === "denied" || status === "error" ? (
                    <button onClick={onRetry} style={RETRY_STYLE} type="button">
                      {t.permission_retry}
                    </button>
                  ) : null}
                  <Link href="/index" style={MANUAL_LINK_STYLE}>
                    {t.scan_back_to_index}
                  </Link>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <p style={HELPER_STYLE}>
        {showVideo ? t.scan_helper : helperForStatus(status, t)}
      </p>

      <button
        onClick={() => setManualOpen(true)}
        style={MANUAL_LINK_STYLE}
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
            <h2 style={RECOVERY_TITLE_STYLE}>{t.permission_denied_title}</h2>
            <p style={RECOVERY_BODY_STYLE}>{t.permission_denied_body}</p>
          </>
        ),
        actions: true,
      };
    case "no-camera":
      return {
        body: (
          <>
            <h2 style={RECOVERY_TITLE_STYLE}>{t.permission_no_camera_title}</h2>
            <p style={RECOVERY_BODY_STYLE}>{t.permission_no_camera_body}</p>
          </>
        ),
        actions: true,
      };
    case "insecure":
      return {
        body: (
          <>
            <h2 style={RECOVERY_TITLE_STYLE}>{t.permission_insecure_title}</h2>
            <p style={RECOVERY_BODY_STYLE}>{t.permission_insecure_body}</p>
          </>
        ),
        actions: true,
      };
    case "unsupported":
      return {
        body: (
          <>
            <h2 style={RECOVERY_TITLE_STYLE}>{t.permission_no_camera_title}</h2>
            <p style={RECOVERY_BODY_STYLE}>{t.permission_no_camera_body}</p>
          </>
        ),
        actions: true,
      };
    case "error":
      return {
        body: (
          <>
            <h2 style={RECOVERY_TITLE_STYLE}>{t.permission_denied_title}</h2>
            <p style={RECOVERY_BODY_STYLE}>{t.permission_denied_body}</p>
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
