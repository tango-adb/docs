---
sidebar_position: 2
---

# Create connection

:::danger

This is not tested yet.

:::

## `TCPSocket`

<Tabs className="runtime-tabs" groupId="runtime">
<TabItem value="web" label="Web">

[Direct Socket API](https://github.com/WICG/direct-sockets) will allow Web apps to connect to Android devices over TCP.

</TabItem>
<TabItem value="node" label="Node.js">

The following code converts Node.js's `net.Socket` to a [Direct Socket API](https://github.com/WICG/direct-sockets) `TCPSocket`:

```ts transpile
import { connect, type Socket } from "node:net";

export interface TCPSocketOptions {
  noDelay?: boolean;
}

export interface TCPSocketOpenInfo {
  readable: ReadableStream<Uint8Array>;
  writable: WritableStream<Uint8Array>;

  remoteAddress: string;
  remotePort: number;

  localAddress: string;
  localPort: number;
}

export class TCPSocket {
  #socket: Socket;
  #opened = new PromiseResolver<TCPSocketOpenInfo>();

  constructor(
    remoteAddress: string,
    remotePort: number,
    options?: TCPSocketOptions,
  ) {
    this.#socket = connect(remotePort, remoteAddress);

    if (options?.noDelay) {
      this.#socket.setNoDelay(true);
    }
    this.#socket.on("connect", () => {
      this.#opened.resolve({
        remoteAddress,
        remotePort,
        localAddress: this.#socket.localAddress!,
        localPort: this.#socket.localPort!,
        readable: new ReadableStream({
          pull: async (controller) => {
            const handleData = (chunk: Uint8Array) => {
              this.#socket.off("data", handleData);
              this.#socket.off("end", handleEnd);
              controller.enqueue(chunk);
            };
            const handleEnd = () => {
              this.#socket.off("data", handleData);
              this.#socket.off("end", handleEnd);
              controller.close();
            };
            this.#socket.on("data", handleData);
            this.#socket.on("end", handleEnd);
          },
        }),
        writable: new WritableStream({
          write: async (chunk) => {
            return new Promise<void>((resolve, reject) => {
              if (!this.#socket.write(chunk)) {
                this.#socket.once("drain", resolve);
              } else {
                resolve();
              }
            });
          },
          close: async () => {
            this.#socket.end();
          },
        }),
      });
    });

    this.#socket.on("error", (error) => {
      this.#opened.reject(error);
    });
  }
}
```

</TabItem>
</Tabs>

## `AdbDaemonDirectSocketsDevice`

The following code implements an `AdbDaemonDevice` using a `TCPSocket`:

```ts transpile
import type { AdbDaemonDevice } from "@yume-chan/adb";
import { AdbPacket, AdbPacketSerializeStream } from "@yume-chan/adb";
import type { ReadableStream, WritableStream } from "@yume-chan/stream-extra";
import {
  StructDeserializeStream,
  UnwrapConsumableStream,
  WrapReadableStream,
  WrapWritableStream,
} from "@yume-chan/stream-extra";

class AdbDaemonDirectSocketsDevice implements AdbDaemonDevice {
  static isSupported(): boolean {
    return typeof globalThis.TCPSocket !== "undefined";
  }

  readonly serial: string;

  readonly host: string;

  readonly port: number;

  name: string | undefined;

  constructor(host: string, port = 5555, name?: string) {
    this.host = host;
    this.port = port;
    this.serial = `${host}:${port}`;
    this.name = name;
  }

  async connect() {
    const socket = new TCPSocket(this.host, this.port, {
      noDelay: true,
    });
    const { readable, writable } = await socket.opened;

    return {
      readable: new WrapReadableStream(readable).pipeThrough(
        new StructDeserializeStream(AdbPacket),
      ),
      writable: new WrapWritableStream(writable)
        .bePipedThroughFrom(new UnwrapConsumableStream())
        .bePipedThroughFrom(new AdbPacketSerializeStream()),
    };
  }
}
```

## Usage

The following code creates a connection:

```ts transpile
const device: AdbDaemonDirectSocketsDevice = new AdbDaemonDirectSocketsDevice(
  "192.168.0.100",
  5555,
);

const connection: ReadableWritablePair<
  AdbPacketData,
  Consumable<AdbPacketInit>
> = await device.connect();
```
