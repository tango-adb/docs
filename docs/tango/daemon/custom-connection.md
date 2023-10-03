---
sidebar_position: 3
---

# Create custom connection

:::note

Daemon connection is still dealing with exclusive device access. If you want to create a mux protocol, create a custom transport instead.

:::

We have seen [`AdbDaemonWebUsbDevice`](./usb/get-devices.md) class in USB connection and [`AdbDaemonDirectSocketsDevice`](./tcp/create-connection.md#adbdaemondirectsocketsdevice) class in TCP connection, but they are high-level abstractions for managing devices. In fact, `AdbDaemonTransport` only needs a pair of [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) and [`WriteableStream`](https://developer.mozilla.org/en-US/docs/Web/API/WritableStream) to work, that's what the `connect` method in those `Device` classes returns.

:::note

See [Web Streams Basics](../web-stream.md) for a quick introduction to Web Streams API.

:::

## AdbPacket

ADB protocol is based on packets, and `AdbDaemonTransports` deals with deserialized `AdbPacket` objects. Each connection can serialize and transfer those packets in different ways. For example, USB and TCP connections convert them to raw bytes and transfer through USB or TCP. But custom connections can also transfer them using JSON, protobuf, or any other formats over the Internet.

`AdbPacket` is slightly different between the read and write sides.

On the `ReadableStream` side, each object only have the following data fields, so they are also called `AdbPacketData`:

- command: A number that represents the command.
- arg0: A number that represents the first argument.
- arg1: A number that represents the second argument.
- payload: A `Uint8Array` that represents the payload.

For the `WriteableStream` side, each object has two extra fields, which are required when writing to devices. These objects are also called `AdbPacketInit`:

- checksum: A number that represents the checksum of the packet.
- magic: A number that represents the magic of the packet.

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
