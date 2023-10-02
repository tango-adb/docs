---
sidebar_position: 5
---

# read

Read file content on the device filesystem.

```ts
declare class AdbSync {
  read(filename: string): ReadableStream<Uint8Array>;
}
```

:::danger READ ALL STREAMS!

ADB is a multiplexing protocol (multiple logic streams are transferred over one connection), so blocking one stream will block all other streams.

You must continuously read from the returned stream to prevent this from happening.

:::

## Example

```ts transpile
const content = sync.read("/sdcard/Download/hello.txt");
await content.pipeTo(
  new WritableStream({
    write(chunk) {
      console.log(chunk);
    },
  }),
);
```

:::info Equivalent ADB Command

```sh
adb pull /sdcard/Download/hello.txt
```

:::
