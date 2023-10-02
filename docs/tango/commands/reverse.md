---
sidebar_position: 4
---

# reverse

Manage reverse port forwarding.

Reverse port forwarding (reverse tunnel) allows you to listen on a socket address on the device. When an app on Android connects to that address, the connection will be forward to Tango.

```ts
declare class AdbReverseCommand {
  list(): Promise<AdbForwardListener[]>;

  addExternal(deviceAddress: string, localAddress: string): Promise<string>;

  add(
    deviceAddress: string,
    handler: AdbIncomingSocketHandler,
    localAddress?: string,
  ): Promise<string>;

  remove(deviceAddress: string): Promise<void>;
}
```

## Errors

```ts
declare class AdbReverseError extends Error {}

declare class AdbReverseNotSupportedError extends AdbReverseError {}
```

ADB daemon on Android 8 and below had a bug that prevented reverse port forwarding from working when ADB is connected over WiFi. When this happens, an `AdbReverseNotSupportedError` will be thrown.

ADB daemon may also return other errors, an `AdbReverseError` will be thrown in this case. The `message` field of the error will contain a human-readable error message.

## List existing port forwards

```ts
interface AdbForwardListener {
  deviceSerial: string;
  localName: string;
  remoteName: string;
}

declare class AdbReverseCommand {
  list(): Promise<AdbForwardListener[]>;
}
```

The returned `AdbForwardListener` objects contain the following fields:

- `deviceSerial`: Serial number of the device
- `localName`: Socket address on device
- `remoteName`: Socket address on host

:::info Equivalent ADB command

```sh
adb reverse --list
```

:::

## Add an external port forwarding

```ts
declare class AdbReverseCommand {
  addExternal(deviceAddress: string, localAddress: string): Promise<string>;
}
```

Add an external (unmanaged) port forwarding to the device. When apps on device connects to `deviceAddress`, ADB daemon forwards the connection to the transport, and it's the transport's responsibility to forward the connection to `localAddress`.

Some transports may not support external port forwarding. For example `AdbDaemonTransport` can't connect to socket addresses on the host machine, so it doesn't support external port forwarding.

When `deviceAddress` is `tcp:0`, ADB daemon will choose an available port on the device. On Android 8 and later, the chosen port will be returned. Otherwise, the return value will be the same as `deviceAddress`.

### Example

```ts transpile
const port = await adb.reverse.addExternal("tcp:0", "tcp:1234");
console.log(port); // tcp:38324
```

:::info Equivalent ADB command

```sh
adb reverse tcp:0 tcp:1234
```

:::

## Add a managed port forwarding

```ts
type AdbIncomingSocketHandler = (socket: AdbSocket) => ValueOrPromise<void>;

declare class AdbReverseCommand {
  add(
    deviceAddress: string,
    handler: AdbIncomingSocketHandler,
    localAddress?: string,
  ): Promise<string>;
}
```

Add a managed port forwarding to the device. When apps on device connects to `deviceAddress`, ADB daemon forwards the connection to the transport, and the transport will call `handler` with the socket.

This method is guaranteed to work on all transports.

When `deviceAddress` is `tcp:0`, ADB daemon will choose an available port on the device. On Android 8 and later, the chosen port will be returned.

The meaning of `localAddress` depends on the transport:

| Transport            | Valid values                                    | Default value                              |
| -------------------- | ----------------------------------------------- | ------------------------------------------ |
| `AdbDaemonTransport` | Any string that uniquely identifies the handler | A random string                            |
| `AdbServerTransport` | Any available local socket address              | Automatically choose an available TCP port |

:::danger READ ALL STREAMS!

ADB is a multiplexing protocol (multiple logic streams are transferred over one connection), so blocking one stream will block all other streams.

You must continuously read from all incoming streams (even if you are not interested in them) to prevent this from happening.

:::

### Example

Creates an echo server.

```ts transpile
import { encodeUtf8 } from "@yume-chan/adb";
import { DecodeUtf8Stream, Consumable } from "@yume-chan/stream-extra";

const address = await adb.reverse.add("tcp:1234", async (socket) => {
  const writer = socket.writable.getWriter();
  await socket.readable.pipeTo(
    new WriteableStream({
      async write(chunk) {
        await writer.write(new Consumable(chunk));
      },
    }),
  );
});
```

:::info Equivalent ADB command

There is no equivalent ADB command.

:::

## Remove a port forwarding

```ts
declare class AdbReverseCommand {
  remove(deviceAddress: string): Promise<void>;
}
```

Remove a port forwarding from the device using the socket address on device.

### Example

```ts transpile
await adb.reverse.remove("tcp:1234");
```

:::info Equivalent ADB command

```sh
adb reverse --remove tcp:1234
```

:::
