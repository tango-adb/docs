---
sidebar_position: 2
---

# Create connection

:::danger

This is not tested yet.

:::

## `TCPSocket`

[Direct Socket API](https://github.com/WICG/direct-sockets) is a new Web API that allows Web apps to create TCP and UDP sockets. The `TCPSocket` class from this API can be used to create a TCP connection to an Android device.

<Tabs className="runtime-tabs" groupId="runtime">
<TabItem value="web" label="Web">

Currently no browser supports this API.

</TabItem>
<TabItem value="node" label="Node.js">

The following code converts Node.js's `net.Socket` to a `TCPSocket`:

```ts transpile
import {
  PushReadableStream,
  type ReadableStream,
  type WritableStream,
} from "@yume-chan/stream-extra";
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
      const readable = new PushReadableStream((controller) => {
        this.#socket.on("data", async (data) => {
          this.#socket.pause();
          await controller.enqueue(data);
          this.#socket.resume();
        });

        this.#socket.on("end", () => {
          try {
            controller.end();
          } catch {}
        });

        controller.abortSignal.addEventListener("abort", () => {
          this.#socket.end();
        });
      });

      this.#opened.resolve({
        remoteAddress,
        remotePort,
        localAddress: this.#socket.localAddress!,
        localPort: this.#socket.localPort!,
        readable,
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

:::note Next Step

[Create credential store](../credential-store.md)

:::
