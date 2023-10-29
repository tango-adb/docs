---
sidebar_position: 4
---

# Custom transport

Tango also supports custom transports. For example, a mock transport can be used in tests, or a proxy transport can share a device with multiple clients.

Unlike [custom daemon connections](./daemon/custom-connection.md), custom transports don't care about ADB protocol. Custom transports works on high-level ADB sockets

After handshake, the whole job of ADB protocol is managing and multiplexing ADB sockets. Similarly, ADB server's core function is creating sockets to ADB daemon and forwarding socket data. So, `Adb` class is designed to work with ADB sockets.

## ADB Socket

Each ADB socket is basically a pair of `ReadableStream<Uint8Array>` and `WritableStream<Consumable<Uint8Array>>`.

:::note

See [Web Streams Basics](./web-stream.md) for a quick introduction to `ReadableStream`, `WriteableStream`, and other types from [Web Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API).

:::

```ts
import type { Consumable } from "@yume-chan/stream-extra";

interface AdbSocket {
  readonly service: string;

  readable: ReadableStream<Uint8Array>;
  writable: WritableStream<Consumable<Uint8Array>>;

  close(): void | Promise<void>;
}
```

After calling `close`, `readable` shouldn't produce any more data, and `writable` should throw an error when trying to write.

Close `readable` should close `writable` as well, and vice versa.

## ADB Transport

```ts
export interface AdbTransport {
  readonly serial: string;

  readonly maxPayloadSize: number;

  readonly banner: AdbBanner;

  readonly disconnected: Promise<void>;

  connect(service: string): AdbSocket | Promise<AdbSocket>;

  addReverseTunnel(
    handler: AdbIncomingSocketHandler,
    address?: string,
  ): string | Promise<string>;

  removeReverseTunnel(address: string): void | Promise<void>;

  clearReverseTunnels(): void | Promise<void>;

  close(): void | Promise<void>;
}
```

As mentioned before, the main function of `AdbTransport` is the `connect` method, which creates an ADB socket for a service (request).

Other fields:

- `serial`: The serial number of the device. `Adb` class doesn't use it, but it's useful for logging.
- `maxPayloadSize`: The maximum payload size of the device. `AdbSync#write` will split data into multiple packets if it's larger than this value. If you don't know this value, use 4KB.
- `banner`: ADB banner returned from the device. It contains the list of ADB features the device supports, which is important for many command to choose the correct behavior.
- `disconnected`: A promise that resolves when the transport is disconnected.
- `addReverseTunnel`, `removeReverseTunnel`, `clearReverseTunnels`: These methods are used to manage reverse tunnels. When a reverse tunnel is created, Tango sends the correct command to ADB daemon via `connect` method, but also calls `addReverseTunnel` method. The transport should register the reverse tunnel, so when ADB daemon creates a socket to the tunnel address, the `handler` method will be invoked. If the transport doesn't support reverse tunnel, it should throw an error from `addReverseTunnel` method. See [Reverse Tunnel](./commands/reverse.md) for more details.
- `close`: Close the transport. It should close all sockets created by `connect` method, and resolve `disconnected` promise.

## Example

This creates a mock transport that responds to `getprop` shell command:

```ts transpile
import {
  AdbBanner,
  AdbIncomingSocketHandler,
  AdbSocket,
  AdbTransport,
} from "@yume-chan/adb";
import { PromiseResolver } from "@yume-chan/async";
import {
  Consumable,
  ReadableStream,
  WritableStream,
} from "@yume-chan/stream-extra";
import { ValueOrPromise, encodeUtf8 } from "@yume-chan/struct";

class MockSocket implements AdbSocket {
  service: string;
  readable: ReadableStream<Uint8Array>;
  writable: WritableStream<Consumable<Uint8Array>>;

  closed = false;

  constructor(service: string, response: Uint8Array) {
    this.service = service;

    this.readable = new ReadableStream({
      start(controller) {
        controller.enqueue(response);
        controller.close();
      },
    });

    this.writable = new WritableStream({
      write(chunk) {
        if (closed) {
          throw new Error("Socket closed");
        } else {
          console.log(chunk);
        }
      },
    });
  }

  close(): ValueOrPromise<void> {
    this._closed = true;
  }
}

class MockTransport implements AdbTransport {
  get serial(): string {
    return "12345678";
  }

  get maxPayloadSize(): number {
    return 4 * 1024;
  }

  get banner(): AdbBanner {
    return new AdbBanner("mock", "mock", "mock", []);
  }

  #disconnected = new PromiseResolver<void>();
  get disconnected(): Promise<void> {
    return this.#disconnected.promise;
  }

  connect(service: string): AdbSocket {
    if (service.startsWith("shell:getprop")) {
      const key = service.split(" ")[1];
      switch (key) {
        case "ro.product.model":
          return new MockSocket(service, encodeUtf8("Pixel 3a"));
      }
    }

    throw new Error(`Unknown service: ${service}`);
  }

  addReverseTunnel(
    handler: AdbIncomingSocketHandler,
    address?: string | undefined,
  ): ValueOrPromise<string> {
    throw new Error("Method not implemented.");
  }

  removeReverseTunnel(address: string): ValueOrPromise<void> {
    throw new Error("Method not implemented.");
  }

  clearReverseTunnels(): ValueOrPromise<void> {
    throw new Error("Method not implemented.");
  }

  close(): ValueOrPromise<void> {
    this.#disconnected.resolve();
  }
}
```