---
sidebar_position: 3
---

# isDirectory

This method uses a trick of `lstat` to check if a path is a directory, or a symlink to a directory.

```ts
declare class AdbSync {
  isDirectory(path: string): Promise<boolean>;
}
```

As stated in [`lstat`/`stat`](./stat.md) page, sync protocol doesn't support `stat` system call (which follows symlinks) until Android 8. This method doesn't use `stat` to follow symlinks, but appends a `/` to the path and calls `lstat` instead. Which means this method works on all Android versions.

If a file system error (e.g. target not exist) occurs, this method will return `false`.

## Example

```ts
const isDirectory = await sync.isDirectory("/sdcard");
```

:::info[Equivalent ADB command]

Although not exactly the same:

```sh
adb shell stat -L -c %F /sdcard
```

:::

## Internal API

:::info

**Note:** This is an internal API that is usually not needed directly. Most users should use the public API (`adb.sync.isDirectory`) instead.

:::

The `isDirectory` method uses `AdbSync.Stat.lstat()` internally with a path modification:

```ts
import type { SocketPool } from "@yume-chan/adb";
import { AdbSync } from "@yume-chan/adb";

declare const pool: SocketPool;
declare const path: string;

// highlight-start
try {
  // Appends "/" to path and calls lstat
  await AdbSync.Stat.lstat(pool, path + "/", {
    version: 2, // or 1 for legacy protocol
  });
  return true; // If lstat succeeds, it's a directory
} catch {
  return false; // If lstat fails, it's not a directory
}
// highlight-end
```

### How it works

The trick works because:

1. On Unix-like systems (including Android), appending `/` to a path forces the kernel to check if the path is a directory
2. If the path is a directory or symlink to a directory, `lstat` succeeds
3. If the path is a file or doesn't exist, `lstat` fails with an error

This approach works on all Android versions, unlike `stat` which requires Android 8+ for symlink resolution.
