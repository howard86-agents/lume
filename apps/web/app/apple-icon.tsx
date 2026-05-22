import { ImageResponse } from "next/og";

/**
 * Apple-touch-icon — the 180x180 PNG iOS Safari uses when a visitor
 * adds Lume to their Home Screen. Picked up automatically by Next's
 * Metadata API and emitted as `<link rel="apple-touch-icon" href=...>`
 * into the document head.
 *
 * Apple historically does *not* read the manifest's icon list for the
 * Home Screen icon, so this dynamic icon is the canonical iOS path.
 *
 * Composition mirrors `app/icon.tsx` so the home-screen icon visually
 * matches the favicon and Android launcher icons.
 */

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  const dimension = size.width;
  const cornerRadius = Math.round(dimension * 0.22);
  const haloSize = Math.round(dimension * 0.92);
  const coreSize = Math.round(dimension * 0.42);
  const innerCoreSize = Math.round(dimension * 0.13);
  return new ImageResponse(
    <div
      style={{
        position: "relative",
        width: dimension,
        height: dimension,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #0e0d18 0%, #08080d 100%)",
        borderRadius: cornerRadius,
        boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.06)",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: haloSize,
          height: haloSize,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 50% 50%, rgba(255, 206, 122, 0.78) 0%, " +
            "rgba(179, 144, 255, 0.45) 45%, rgba(10, 10, 15, 0) 100%)",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: coreSize,
          height: coreSize,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 50% 50%, rgba(255, 245, 224, 0.95) 0%, " +
            "rgba(255, 183, 85, 0.72) 55%, rgba(122, 58, 0, 0) 100%)",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: innerCoreSize,
          height: innerCoreSize,
          borderRadius: "50%",
          background: "rgba(255, 245, 224, 0.95)",
          display: "flex",
        }}
      />
    </div>,
    { ...size }
  );
}
