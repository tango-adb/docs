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
const isDirectory = await sync.isDirectory('/sdcard');
```

:::info Equivalent ADB command

Although not exactly the same:

```sh
adb shell stat -L -c %F /sdcard
```
