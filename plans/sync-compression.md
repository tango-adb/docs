# Plan: Document Sync Compression Adapters (commit 6f0e703)

Source commit: `6f0e703e2e67162afa2b459936c17124c465739d` — "feat(adb/sync): support external compression adapters (#861)"

## Background

The commit refactors ADB sync compression from a built-in `CompressionStream`/`DecompressionStream` runtime dependency into a registry-based adapter system. Key changes:

- New `libraries/adb-compression-zstd` package exposing `registerZstdCompression()`.
- `AdbSync.Compression` now exposes `registerCompressionAdapter(format, adapter)` and `registerDecompressionAdapter(format, adapter)`.
- Compression support checks (`canUseFormat`, `canUseBrotli/Lz4/Zstd`, `chooseFormat`) now also check for registered adapters in addition to native runtime support (previously they only checked for native `CompressionStream`/`DecompressionStream`).
- New `Compression.FormatNameMap` for human-readable format names.
- `Service.read()` no longer the only read entry point; `Service.createReadable(path, compression)` returns a `PullSession`.
- `Service.write()` options renamed: `filename` → `path`, `file` → `readable` (passed separately to `write()`).
- `Service.createWritable(options)` returns a `SendSession`.
- `write()` now resolves with `{ bytesWritten, compression, bytesCompressed }` instead of `void`.
- `SendV2Flags` renamed to the shared `SyncFlag` (internal change — no public API docs use `SendV2Flags`; verify none do, and note it if the rename surfaces anywhere); pull now supports compression flags (`RCV2`).

## Documentation Files to Update

### 1. `docs/api/adb/sync/write.mdx`

- Recommend `Service.write` for simple cases (one-off file push) and `Service.createWritable` for advanced cases (manual stream control, progress tracking via live getters).
- Rename `filename` → `path` and `file` → `readable` in the `AdbSyncWriteOptions` interface block.
- Update `write()` signature: `write(options: AdbSyncWriteOptions & { readable: ReadableStream<MaybeConsumable<Uint8Array>> }): Promise<Omit<SendSession, "writable">>`.
- Document the `SendSession` interface (used by `createWritable`):
  - `writable: WritableStream<MaybeConsumable<Uint8Array>>`: The stream to write file content into.
  - `bytesWritten: number`: (Getter) Number of bytes written into the `writable` stream.
  - `compression?: Compression.Format`: The compression format used (or `undefined` for v1).
  - `bytesCompressed: number`: (Getter) Size of compressed data sent to the device.
- Note that `bytesWritten` and `bytesCompressed` are **live getters**. Users can poll them while the stream is active to calculate real-time compression ratios or progress for UI display.
- Update option descriptions: `path` (was `filename`), `readable` (was `file`), and clarify `compression` semantics:
  - `undefined` → auto-select best format supported by device + runtime.
  - explicit format → error if unsupported (device or runtime).
  - `Compression.Format.None` → no compression.
  - on v1 devices (no `sendrecv_v2`) compression is ignored/disabled.
- Update the "Internal API" section to use `AdbSync.Send.send({ version, pool, ...options })` and note it now returns a `Promise<SendSession>`.
- Add adapter registration example (e.g. `registerZstdCompression` from `@yume-chan/adb-compression-zstd`) in a new subsection under Compression.
- Remove `Compression.canUseFormat(adb, format)` two-arg examples; use the new three-arg form `Compression.canUseFormat(adb, format, Compression.Mode.Compress)`.

### 2. `docs/api/adb/sync/read.mdx`

- Recommend `Service.read` for simple cases (straightforward file content retrieval) and `Service.createReadable` for advanced cases (manual stream control, progress tracking via live getters).
- Document new `createReadable(path, compression?)` returning `PullSession`.
- Document the `PullSession` interface:
  - `readable: ReadableStream<Uint8Array>`: The stream to read file content from.
  - `bytesRead: number`: (Getter) Number of bytes read from the `readable` stream.
  - `compression?: Compression.Format`: The compression format used (or `undefined` for v1).
  - `bytesCompressed: number`: (Getter) Size of compressed data received from the device.
- Note that `bytesRead` and `bytesCompressed` are **live getters**. Users can poll them while the stream is active to calculate real-time compression ratios or progress for UI display.
- Keep `read(path): ReadableStream<Uint8Array>` as the simple wrapper.
- Update "Internal API" section: `AdbSync.Receive.stream` → `AdbSync.Receive.pull(version, pool, path, compression?)`, noting it returns a `PullSession`.
- Add a "Compression" section explaining that read (pull) can request decompression, mirroring write's auto-selection/validation logic (uses `Compression.Mode.Decompress`).

### 3. `docs/api/adb/sync/index.mdx`

- Add `createReadable` and `createWritable` to the supported-methods list.
- Note the socket pool now keeps the Node process alive via reference counting and uses `unref` on created sockets; document `SocketPool` only if a dedicated page exists.
- Update socket-pool usage examples if `withSocket`/`acquireSocket`/`releaseSocket` wording changed.

### 4. `docs/tango/upgrade.mdx`

- All changes in this section should be added under a new `## New in beta 2` heading at the top of the file.
- Expand "Additional Improvements" / "Compression support" bullet to mention:
  - external adapter registration (`registerCompressionAdapter` / `registerDecompressionAdapter`),
  - new `@yume-chan/adb-compression-zstd` package,
  - `mode` argument in support checks,
  - rename of `filename`/`file` to `path`/`readable` in `write()` options (breaking change), return value change from `void` to bytes-written object,
  - pull-side decompression (was push-only).
- Update `SocketPool` section: mention that it now uses `unref` on idle sockets and Node.js timers to allow the process to exit when no sync commands are running. However, while a command is active, it adds a reference to keep the process alive.
- Update "Writing files" public API example to `adb.sync.write({ path, readable })`.
- Update "Internal API Changes" example to `AdbSync.Send.send({ pool, path, readable, version })` (drop `filename`/`file`).
- Ensure all breaking changes are marked with the 💥 icon as per the legend in `upgrade.mdx`.

### 5. New folder `docs/api/adb/sync/compression/`

Make compression documentation a folder with two pages (add `_category_.yml` with `label: "compression"` and appropriate `position`/`collapsed`):

#### 5a. `compression/index.mdx` — Compression overview

- Document the `AdbSync.Compression` namespace:
  - `Format` values (`None`, `Brotli`, `Lz4`, `Zstd`)
  - `FormatNameMap`
  - `Mode` (`Compress`/`Decompress`)
  - `registerCompressionAdapter(format, adapter)`
  - `registerDecompressionAdapter(format, adapter)`
  - `canUseFormat`, `canUseBrotli`, `canUseLz4`, `canUseZstd`, `chooseFormat`
  - `createCompressionStream`, `createDecompressionStream`
- Explain the adapter registry architecture: native runtime support (browser `CompressionStream`/`DecompressionStream`) is checked first, then registered adapters; `create*Stream` throws if neither exists.
- Note adapters can be registered before connecting; support checks pick them up automatically.
- Add **Runtime Support Tables** for each algorithm (use `<CanIUse>` widget for browser support):

| Algorithm | Node.js | Browsers | Adapter Package |
|-----------|---------|----------|-----------------|
| Brotli    | v22.20+ / v24.7+ (CompressionStream/DecompressionStream) | Firefox, Safari (via `<CanIUse feature="mdn-api_compressionstream_compressionstream_brotli" />`) | built-in |
| Zstd      | ❌ Not supported natively | ✅ via `@yume-chan/adb-compression-zstd` (WebAssembly/Comlink worker) | `@yume-chan/adb-compression-zstd` |
| LZ4       | ❌ Not supported natively | ❌ Not supported natively | custom adapter (if provided) |

- Document that Zstd and LZ4 require an external adapter; Brotli works natively where available.

#### 5b. `compression/adb-compression-zstd.mdx` — `@yume-chan/adb-compression-zstd` package

- Dedicated page for the `@yume-chan/adb-compression-zstd` package (renameable to the package name in sidebar):
  - `registerZstdCompression(options)` — registers both compress and decompress adapters for Zstd.
  - Options: `compressionLevel?: number` (default `1`), and `worker?: "auto" | boolean | undefined`.
  - **`compressionLevel` option**: add its own explanation. The default level of `1` is chosen to match Google ADB's default Zstd compression level, as defined in [`compression_utils.h`](https://android.googlesource.com/platform/packages/modules/adb/+/bdebc9b22cee5b2aec2e919d176d915725188fc8/compression_utils.h#442). Lower levels compress faster but produce larger output; higher levels compress slower but achieve better ratios. Only applies when the actual compression adapter uses the corresponding format (Zstd); provide guidance that a value matching device-side expectations (e.g. Google's `1`) is usually best for sync throughput/CPU balance.
  - **`worker` option**: expand into its own subsection. The behavior mirrors the Web Worker section of the [H264BSD decoder](../../../../scrcpy/video/tiny-h264.mdx#web-worker) page — describe that `"auto"` (default) creates a Web Worker when running in the main thread, `true` always creates a worker, and `false` runs inline on the current thread. Include a behavior table like tiny-h264.mdx's and note that a `Worker` instance is created per adapter and terminated on flush/cancel. (Note: unlike H264BSD, the zstd adapter does not render to a canvas, so no `OffscreenCanvas`/`transferControlToOffscreen` requirement applies.)
  - Explain WebAssembly implementation (`@structured-world/structured-zstd`) and Comlink worker-based streaming; a `Worker` and WASM are required.
  - Runtime support: browsers only (Node.js not supported).
  - Registration example:

```ts
import { registerZstdCompression } from "@yume-chan/adb-compression-zstd";

registerZstdCompression();
// Auto-detects main thread; pass { worker: true } to force worker,
// or { worker: false } to run inline
```

  - After registration, `AdbSync.Compression.canUseZstd(adb, Compression.Mode.Compress)` returns `true` (given device `sendrecv_v2` support) and auto-selection will pick Zstd first.

### 6. `docs/api/adb/socket.mdx`

- Update `createSocket` signature to show the optional `options` parameter (e.g. `{ unref?: boolean }`).
- Briefly mention `unref` behavior in Node.js (doesn't keep the process alive).

### 7. Search for stale references

- Grep for `filename`, `AdbSync.Receive.stream`, `Compression.canUseFormat` (two-arg), `adb.sync.withSocket`, `sendrecv_v2` wording across non-versioned docs and update.

### 8. `docs/tango/custom-transport/transport.mdx`

- Update `AdbTransport` interface definition: `connect(service: string, options?: AdbTransport.ConnectOptions): AdbSocket | Promise<AdbSocket>`.
- Document the new `AdbTransport.ConnectOptions` namespace/interface:
  - `unref?: boolean | undefined`: If `true`, the transport should attempt to create a connection that doesn't keep the runtime process alive (primarily for Node.js).
- Update the `MockTransport` example to include the `options` parameter in the `connect` method signature.
- Mention that this is used by `SocketPool` to allow the Node.js process to exit even if there are idle sync sockets.

- Include **Source Reference Comments** immediately after the H1 heading in all new/updated API documentation pages, following the `AGENTS.md` rule: `{/* Source: <path> | Commit: 6f0e703e2e67162afa2b459936c17124c465739d */}`.
- Ensure all TypeScript code blocks follow **TypeScript Code Block Standards**:
  - Explicit type annotations on all variables (e.g., `const session: PullSession`).
  - Use `import type` for type-only imports and merge imports from the same module.
  - Use `declare const` for external variables.
  - Ensure examples are self-contained with all necessary imports.
- Use `:::info[Equivalent ADB Command]` or `:::info` for equivalent shell commands and supplemental info.
- Apply **General Formatting Rules**:
  - Exactly 1 empty line before and after headers and code blocks.
  - No more than 1 consecutive empty line (`\n\n` max).
  - One empty line before and after lists.
  - Use Markdown code spans for technical terms.
- For the new `compression/` folder, ensure `_category_.yml` follows the navigation rules (include `label`, `position`, and `collapsed: false`).

## Housekeeping

- Run `node format-mdx.js` on all edited MDX files.
- After each `edit` on MDX, run the MDX comment fix:

```bash
sed -i 's/{\/\\\*/{\/\*/g' path/to/file.mdx && sed -i 's/\\\*\/*}/\*\/}/g' path/to/file.mdx
```

- Verify MDX comments: `grep -c "{/*" path/to/file.mdx` and `grep -c "*/}" path/to/file.mdx` match.
- If adding a new MDX page, add `sidebar_position` frontmatter and run the sidebar update script if needed.
