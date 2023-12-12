---
sidebar_position: 3
---

# Server commands

Google ADB client/server has a separate protocol and a separated command set. Some commands are handled by the server itself, and others operates on a specific device.

## Commands handled by server

### Get version

```ts
declare class AdbServerClient {
  getVersion(): Promise<number>;
}
```

The protocol between ADB client and server has its own version number. This is not Android version (like `13.0`), nor ADB protocol version (like `0x10000001`), nor platform tools version (like `34.0.1`).

This is the version you see in the error message when you use a wrong ADB client to connect to a server:

```text
adb server version (39) doesn't match this client (41); killing...
```

Tango doesn't check the version number, although not thoroughly tested, most of the commands should work on any version of ADB server.

:::info[Equivalent ADB Command]

```sh
adb version
```

If it prints `Android Debug Bridge version 1.0.41`, the protocol version is `41`.

:::

### Kill server

```ts
declare class AdbServerClient {
  killServer(): Promise<void>;
}
```

Stops the server.

:::info[Equivalent ADB Command]

```sh
adb kill-server
```

:::

### Get server features

```ts
declare class AdbServerClient {
  getServerFeatures(): Promise<string[]>;
}
```

Gets the ADB features supported by the server. For Google ADB client, the supported feature list is same between client and server, so this reflects how ADB commands will behave.

But in Tango, all ADB commands are generated from Tango, not the ADB client, so this list is not very useful.

Some interesting features:

- `libusb`: The server is using `libusb` to communicate with devices.
- `delayed_ack` The server supports Delayed Acknowledgment for lower latency. Delayed Acknowledgment is a low-level ADB protocol feature, so not controlled by Tango.

:::info[Equivalent ADB Command]

```sh
adb host-features
```

:::

### Get devices

```ts
interface AdbServerDevice {
  serial: string;
  product?: string | undefined;
  model?: string | undefined;
  device?: string | undefined;
  transportId: bigint;
}

declare class AdbServerClient {
  getDevices(): Promise<AdbServerDevice[]>;
}
```

Gets all connected devices.

:::info

Some lazy manufacturers use the same `serial` for all devices. It's possible that multiple devices with the same `serial` will be returned. So it's recommended to use `transportId` to identify devices.

:::

`transportId` uniquely identifies a connection between server and device, but isn't tied to the device. It will change when the device is disconnected and reconnected.

:::info[Equivalent ADB Command]

```sh
adb devices -l
```

:::

## Commands that operates device

### Device selector

All device commands uses the `AdbServerDeviceSelector` type to select the target device.

```ts
type AdbServerDeviceSelector =
  | { transportId: bigint }
  | { serial: string }
  | { usb: true }
  | { tcp: true }
  | undefined;
```

- `{ transportId: bigint }`: Selects the device with the specified transport ID. (Same as Google ADB's `-t` option)
- `{ serial: string }`: Selects the device with the specified serial number. If there are multiple devices with the same serial number, an error will be thrown. (Same as Google ADB's `-s` option)
- `{ usb: true }`: Selects the only USB device. If there are multiple USB devices, an error will be thrown. (Same as Google ADB's `-d` option)
- `{ tcp: true }`: Selects the only TCP (ADB over WiFi or emulator) device. If there are multiple TCP devices, an error will be thrown. (Same as Google ADB's `-e` option)
- `undefined`: Selects the only device. If there are multiple devices, an error will be thrown. (Same as no options for Google ADB)

:::info

If an `AdbServerDeviceSelector` object has multiple fields, only one of them will be used, based on the order above.

:::

In all fields, only `transportId` is guaranteed to be unique, so it's recommended to always use `transportId` to select devices.

### Get device features

```ts
declare class AdbServerClient {
  getDeviceFeatures(
    selector: AdbServerDeviceSelector,
  ): Promise<{ transportId: bigint; features: AdbFeature[] }>;
}
```

Gets the ADB features supported by the device. It's required for Tango to coordinate the behavior of ADB commands with the device.

For example, if [Shell protocol](../commands/subprocess.md#none-protocol-vs-shell-protocol) is not supported by the device, using `AdbSubprocessShellProtocol` will immediately throw an error.

Usually you don't need to call this method directly, the `AdbServerClient#createTransport` method uses it to create a `AdbTransport` object.

:::info[Equivalent ADB Command]

```sh
adb features
```

:::

### Create device socket

```ts
interface AdbServerSocket extends AdbSocket {
  transportId: bigint;
}

declare class AdbServerClient {
  connectDevice(
    device: AdbServerDeviceSelector,
    service: string,
  ): Promise<AdbServerSocket>;
}
```

Creates a socket to the ADB daemon on the device, letting the server forward packets between the client and the device.

The socket can be used to run an ADB command, or connect to a socket on device.

Usually you don't need to call this method directly, the `AdbServerClient#createTransport` method uses it to implement `AdbTransport`.

:::info[Equivalent ADB Command]

There is no equivalent ADB command.

:::

### Wait for device

```ts
interface AdbServerConnectionOptions {
  unref?: boolean | undefined;
  signal?: AbortSignal | undefined;
}

declare class AdbServerClient {
  waitFor(
    device: AdbServerDeviceSelector,
    state: "device" | "disconnect",
    options?: AdbServerConnectionOptions,
  ): Promise<void>;
}
```

Wait for a device to be connected or disconnected. This method returns a `Promise` that resolves when the condition is met.

If the selector is `usb`, `tcp` or `undefined`, it won't tell which device is connected or disconnected.

Options:

- `unref`: If the underlying connection is using Node.js `net` module, then `unref` the socket so the process can exit even if the connection is still alive.
- `signal`: Stops the wait when the signal is aborted.

:::info[Equivalent ADB Command]

```sh
adb wait-for[-TRANSPORT]-STATE
```

For example:

```sh
adb wait-for-device
adb wait-for-usb-device
adb wait-for-disconnect
adb wait-for-usb-disconnect
```

:::

### Create transport

```ts
declare class AdbServerTransport implements AdbTransport {}

declare class AdbServerClient {
  createTransport(device: AdbServerDeviceSelector): Promise<AdbServerTransport>;
}
```

Creates an `AdbTransport` object for the device. It's not one server command, it uses multiple server commands internally to implement the transport.

The returned transport object can be used to construct an `Adb` instance:

```ts transpile
import { Adb } from "@yume-chan/adb";

const transport: AdbServerTransport = await client.createTransport({
  transportId: 123n,
});
const adb: Adb = new Adb(transport);
```
