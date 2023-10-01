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

:::danger

You must read the stream to the end, otherwise all sockets to the device will be blocked.

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
