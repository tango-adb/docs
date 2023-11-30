---
sidebar_position: 2
---

# Create client

With a server connection, we can create a client:

```ts transpile
import { AdbServerClient } from "@yume-chan/adb";

const client: AdbServerClient = new AdbServerClient(connection);
```

This step doesn't send or receive any packets, it only initializes some internal states.

## Get devices

Use the `AdbServerClient#getDevices` method to get all connected devices:

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

```ts transpile
import type { AdbServerDevice } from "@yume-chan/adb";

const devices: AdbServerDevice[] = await client.getDevices();
if (devices.length === 0) {
  alert("No device connected");
  return;
}

const device = devices[0];
```

## Create transport

Then use the `AdbServerClient#createTransport` method to create a transport and an `Adb` instance:

```ts
type AdbServerDeviceSelector =
  | { transportId: bigint }
  | { serial: string }
  | { usb: true }
  | { tcp: true }
  | undefined;

declare class AdbServerTransport implements AdbTransport {}

declare class AdbServerClient {
  createTransport(device: AdbServerDeviceSelector): Promise<AdbServerTransport>;
}
```

```ts transpile
import { Adb } from "@yume-chan/adb";

const transport: AdbServerTransport = await client.createTransport(device);
const adb: Adb = new Adb(transport);
```

:::info

Because `AdbServerDevice` objects have a `transportId` field, it can also be used as a `AdbServerDeviceSelector`:

:::

:::note[Next Step]

See [commands](../commands/index.md) for how to use the `Adb` instance.

:::

## Other commands

For other commands supported by `AdbServerClient`, see [server commands](./commands.md).
