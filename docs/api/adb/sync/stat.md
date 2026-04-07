---
sidebar_position: 2
---

# lstat/stat

Get file information, similar to Linux [`lstat`/`stat`](https://www.man7.org/linux/man-pages/man2/stat.2.html) system calls/commands

```ts
interface AdbSyncStat {
  mode: number;
  size: bigint;
  mtime: bigint;
  get type(): LinuxFileType;
  get permission(): number;

  uid?: number;
  gid?: number;
  atime?: bigint;
  ctime?: bigint;
}

declare class AdbSync {
  get supportsStat(): boolean;
  lstat(path: string): Promise<AdbSyncStat>;
  stat(path: string): Promise<AdbSyncStat>;
}
```

|                                           | `lstat` (Android 7 and below) | `lstat` (Android 8 and above) | `stat`    |
| ----------------------------------------- | ----------------------------- | ----------------------------- | --------- |
| Android version                           | All                           | 8                             | 8         |
| ADB feature name                          | None                          | `stat_v2`                     | `stat_v2` |
| Sync command                              | `STAT`                        | `LST2`                        | `STA2`    |
| Follow symlinks                           | No                            | No                            | Yes       |
| Size larger than 4GB                      | No                            | Yes                           | Yes       |
| Returns `uid`, `gid`, `atime` and `ctime` | No                            | Yes                           | Yes       |

`mtime`, `atime` and `ctime` are in seconds since Unix epoch.

`AdbSync#supportsStat` property can be used to check if the device supports `LST2` and `STA2` commands (on Android 8 and above).

## Errors

For `lstat` on Android 8 and above and `stat`, if a file system error occurs, a normal `Error` with `message` set to the error name (e.g. `ENOENT`) will be thrown.

All error code and names are:

- EACCES = 13
- EEXIST = 17
- EFAULT = 14
- EFBIG = 27
- EINTR = 4
- EINVAL = 22
- EIO = 5
- EISDIR = 21
- ELOOP = 40
- EMFILE = 24
- ENAMETOOLONG = 36
- ENFILE = 23
- ENOENT = 2
- ENOMEM = 12
- ENOSPC = 28
- ENOTDIR = 20
- EOVERFLOW = 75
- EPERM = 1
- EROFS = 30
- ETXTBSY = 26

For `lstat` on Android 7 and below, the returned `AdbSyncStat` will have all fields set to `0`.

## Example

```ts transpile
const stat = await sync.stat("/sdcard/Download");
console.log(stat);
```

:::info[Equivalent ADB command]

```sh
adb shell stat /sdcard/Download
```

:::

## Internal API

:::info

**Note:** This is an internal API that is usually not needed directly. Most users should use the public API (`adb.sync.lstat` or `adb.sync.stat`) instead.

:::

The stat functions use `AdbSync.Stat.lstat()` and `AdbSync.Stat.stat()` internally, which operate on a `SocketPool`:

```ts
import type { SocketPool } from "@yume-chan/adb";
import { AdbSync } from "@yume-chan/adb";

declare const pool: SocketPool;
declare const path: string;

// highlight-start
// lstat: doesn't follow symlinks (works on all Android versions)
const stat = await AdbSync.Stat.lstat(pool, path, {
  version: 2, // or 1 for legacy protocol
});

// stat: follows symlinks (requires stat_v2 feature)
const stat = await AdbSync.Stat.stat(pool, path);
// highlight-end
```

### Protocol versions

**lstat Version 1 (legacy, Android 7 and below):**

- Uses `STAT` request
- Returns `STAT` response (12 bytes)
- Limited to 32-bit file sizes
- No `uid`, `gid`, `atime`, `ctime` fields
- Returns all zeros on error (no error code)

**lstat Version 2 (Android 8+):**

- Uses `LST2` request
- Returns `LST2` response (full stat structure)
- Supports 64-bit file sizes
- Includes `uid`, `gid`, `atime`, `ctime` fields
- Returns error codes for proper error handling

**stat (Android 8+):**

- Uses `STA2` request
- Same response format as `LST2`
- Follows symlinks to get target file info
- Requires `stat_v2` feature

### How it works

1. Acquires a socket from the pool
2. Sends a `STAT`, `LST2`, or `STA2` request with the file path
3. Waits for single stat response
4. Parses response and throws error if needed
5. Automatically releases the socket back to the pool

The socket is automatically released after completion or error. If a non-sync error occurs (like a network issue), the socket is discarded to prevent connection corruption.
