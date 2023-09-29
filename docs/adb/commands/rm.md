---
sidebar_position: 3
---

# rm

Delete files on device. This method provides compatibilities across all Android versions.

```ts
declare class Adb {
  rm(
    filenames: string | string[],
    options?: { recursive?: boolean; force?: boolean }
  ): Promise<string>;
}
```

## Examples

### Delete a single file

```ts transpile
await adb.rm("/sdcard/Download/foo.txt");
```

### Delete a directory

```ts transpile
await adb.rm("/sdcard/Download/foo", { recursive: true });
```

### Delete multiple files

```ts transpile
await adb.rm(["/sdcard/Download/foo.txt", "/sdcard/Download/bar.txt"]);
```
