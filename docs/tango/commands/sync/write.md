---
sidebar_position: 6
---

# write

Write files to the device filesystem.

If the parent directory does not exist, it will be created.

If the file already exists, it will be overwritten.

```ts
interface AdbSyncWriteOptions {
  filename: string;
  file: ReadableStream<Consumable<Uint8Array>>;
  type?: LinuxFileType;
  permission?: number;
  mtime?: number;
  dryRun?: boolean;
}

declare class AdbSync {
  write(options: AdbSyncWriteOptions): Promise<void>;
}
```

## Options

- `filename`: Path to the file on the device filesystem
- `file`: File content
- `type`: File type, defaults to `LinuxFileType.File`. Can't be `LinuxFileType.Directory`.
- `permission`: File permission, defaults to `0o644`
- `mtime`: File modification time, defaults to current time.
- `dryRun`: If `true`, the file will not be written to the device filesystem. This is useful for testing.

## Example

### Write a file

```ts transpile
import { encodeUtf8 } from "@yume-chan/adb";
import { Consumable } from "@yume-chan/stream-extra";

const file = new ReadableStream({
  start(controller) {
    controller.enqueue(new Consumable(encodeUtf8("Hello, world!")));
    controller.close();
  },
});

await sync.write({
  filename: "/sdcard/Download/hello.txt",
  file,
});
```

:::info Equivalent ADB Command

```sh
echo "Hello, world!" > hello.txt
adb push hello.txt /sdcard/Download/hello.txt
```

:::

### Write a symbolic link

To write a symbolic link, write the target path as content and set type to `LinuxFileType.SymbolicLink`.

```ts transpile
import { encodeUtf8 } from "@yume-chan/adb";
import { Consumable } from "@yume-chan/stream-extra";

await sync.write({
  filename: "/sdcard/Download/hello.txt",
  file: new ReadableStream({
    start(controller) {
      controller.enqueue(
        new Consumable(encodeUtf8("/sdcard/Download/target.txt")),
      );
      controller.close();
    },
  }),
  type: LinuxFileType.SymbolicLink,
});
```

:::info Equivalent ADB Command

```sh
adb shell ln -s /sdcard/Download/target.txt /sdcard/Download/hello.txt
```
