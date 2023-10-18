---
sidebar_position: 3
---

# Create custom connection

:::note

Daemon connections defines how to connect to devices directly. It works on low-level ADB packets, and generally requires exclusive device accesses.

You may also interested in [custom transports](../custom-transport.md), which works on high-level ADB sockets, and can provide shared access to a device.

:::

We have seen [`AdbDaemonWebUsbDevice`](./usb/get-devices.md) class in USB connection and [`AdbDaemonDirectSocketsDevice`](./tcp/create-connection.md#adbdaemondirectsocketsdevice) class in TCP connection, but they are high-level abstractions for managing devices. In fact, `AdbDaemonTransport` only needs a pair of [`ReadableStream<AdbPacket>`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) and [`WriteableStream<Consumable<AdbPacket>>`](https://developer.mozilla.org/en-US/docs/Web/API/WritableStream) to work, that's what the `connect` method in those `Device` classes returns.

:::note

See [Web Streams Basics](../web-stream.md) for a quick introduction to `ReadableStream`, `WriteableStream`, and other types from [Web Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API).

:::

## AdbPacket

ADB protocol is based on packets. `AdbDaemonTransport` works on deserialized `AdbPacket` objects, and a connection is responsible for transferring those packets between device and `AdbDaemonTransport`. USB and TCP connections convert them to raw bytes and send through USB or TCP, while a custom connection may transfer them using JSON, protobuf, or any other formats over TCP, WebSocket, [WebTransport](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport), or any other transportation.

Each `AdbPacket` is an plain object with the following fields: The field names should be self-explanatory.

- command: A 32-bit number.
- arg0: A 32-bit number.
- arg1: A 32-bit number.
- payload: A `Uint8Array`.
- checksum: A 32-bit number calculated by summing all bytes in the `payload`.
- magic: A 32-bit number calculated by `command ^ 0xffffffff`.

`AdbDaemonTransport` will give the connection `AdbPacket`s with all fields filled, but the connection can omit `checksum` and `magic` fields when passing packets to `AdbDaemonTransport`, as those are not essential for basic operations.

## Create ReadableStream

As mentioned in [Web Streams Basics](../web-stream.md), it's very simple to convert pull or push style data sources into `ReadableStream`s.

For pull style data sources, simply use the `ReadableStream`:

```ts transpile
import { AdbPacketData } from "@yume-chan/adb";
import { ReadableStream } from "@yume-chan/stream-extra";

declare function readFromSource(): AdbPacketData | undefined;

const readable = new ReadableStream({
  pull(controller) {
    const packet: AdbPacketData | undefined = readFromSource();
    if (packet) {
      controller.enqueue(packet);
    } else {
      controller.close();
    }
  },
});
```

For push style data sources, use `PushReadableStream`:

```ts transpile
import { AdbPacketData } from "@yume-chan/adb";
import { PushReadableStream } from "@yume-chan/stream-extra";

declare function onPacket(
  handler: (packet: AdbPacketData | undefined) => Promise<void>,
): void;

const readable = new PushReadableStream((controller) => {
  onPacket(async (packet) => {
    if (packet) {
      await controller.enqueue(packet);
    } else {
      controller.close();
    }
  });
});
```

## Create WriteableStream

The write side is simply a `WritableStream`:

```ts transpile
import { AdbPacketInit } from "@yume-chan/adb";
import { WritableStream, Consumable } from "@yume-chan/stream-extra";

declare function writeToSink(packet: AdbPacketInit | undefined): void;

const writeable = new WritableStream<Consumable<AdbPacketInit>>({
  write(chunk) {
    writeToSink(chunk.value);
    chunk.consume();
  },
  end() {
    writeToSink(undefined);
  },
});
```

## Create stream pair

`AdbDaemonTransport` requires a `ReadableWritablePair<AdbPacketData, Consumable<AdbPacketInit>>`, this is simply a plain object with a `readable` field and a `writable` field containing the above two streams.

```ts transpile
import { AdbPacketData, AdbPacketInit } from "@yume-chan/adb";
import { ReadableWritablePair, Consumable } from "@yume-chan/stream-extra";

const connection: ReadableWritablePair<
  AdbPacketData,
  Consumable<AdbPacketInit>
> = {
  readable,
  writable,
};
```

## Convert between raw bytes

The core package also has helper methods to convert streams between `Uint8Array` and `AdbPacket`:

```ts transpile
import { AdbPacketSerializeStream } from "@yume-chan/adb";
import {
  WrapReadableStream,
  WrapWritableStream,
  ReadableStream,
  StructDeserializeStream,
  UnwrapConsumableStream,
} from "@yume-chan/stream-extra";

declare const rawReadable: ReadableStream<Uint8Array>;

const readable = new WrapReadableStream(rawReadable).pipeThrough(
  new StructDeserializeStream(AdbPacket),
);

declare const rawWritable: WritableStream<Uint8Array>;

const writable = new WrapWritableStream(rawWritable)
  .bePipedThroughFrom(new UnwrapConsumableStream())
  .bePipedThroughFrom(new AdbPacketSerializeStream());
```
