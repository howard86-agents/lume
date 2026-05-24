#!/usr/bin/env bun
/**
 * copy-wasm.ts — refreshes the committed zxing-wasm reader binary in
 * public/wasm/ so the scanner is self-hosted at runtime instead of
 * fetching it from a CDN.
 *
 * The copied `public/wasm/zxing_reader.wasm` is committed to the repo so
 * it is guaranteed present on any host without a build-time hook. Run
 * `bun run copy-wasm` after bumping the `barcode-detector` dependency to
 * pull the matching WASM, then commit the refreshed binary.
 */
import { cpSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(
  // Resolve from barcode-detector so we find its zxing-wasm dependency
  // regardless of hoisting strategy.
  import.meta.resolve("barcode-detector/ponyfill")
);

const zxingWasmPkg = require.resolve("zxing-wasm/package.json");
const wasmSrc = join(
  dirname(zxingWasmPkg),
  "dist",
  "reader",
  "zxing_reader.wasm"
);
const wasmDest = join(import.meta.dirname, "..", "public", "wasm");

mkdirSync(wasmDest, { recursive: true });
cpSync(wasmSrc, join(wasmDest, "zxing_reader.wasm"));
console.log("✓ Copied zxing_reader.wasm → public/wasm/");
