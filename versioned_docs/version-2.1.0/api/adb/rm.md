---
sidebar_position: 8
---

# rm

Delete files on device.

```ts
declare class Adb {
  rm(
    filenames: string | string[],
    options?: { recursive?: boolean; force?: boolean },
  ): Promise<string>;
}
```

## Delete readonly files without `--force`

Normally when deleting readonly files, [`rm`](https://www.man7.org/linux/man-pages/man1/rm.1.html) requires the `--force` option to be specified. However, `rm` on some old versions of Android doesn't support `--force` option and always prints a prompt.

This method adds `</dev/null` to the command, making the command non-interactive, so deleting readonly files works without `--force` option on all versions of Android.

Note that the `--force` option also disables the error message when the target doesn't exist. This method can't do that.

## Examples

### Delete a single file

```ts transpile
await adb.rm("/sdcard/Download/foo.txt");
```

:::info[Equivalent ADB Command]

```sh
adb shell rm /sdcard/Download/foo.txt </dev/null
```

:::

### Delete a directory

```ts transpile
await adb.rm("/sdcard/Download/foo", { recursive: true });
```

:::info[Equivalent ADB Command]

```sh
adb shell rm -r /sdcard/Download/foo </dev/null
```

:::

### Delete multiple files

```ts transpile
await adb.rm(["/sdcard/Download/foo.txt", "/sdcard/Download/bar.txt"]);
```

:::info[Equivalent ADB Command]

```sh
adb shell rm -r /sdcard/Download/foo.txt /sdcard/Download/bar.txt </dev/null
```

:::
