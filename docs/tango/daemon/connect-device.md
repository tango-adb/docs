---
sidebar_position: 5
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# Handshake and authenticate

## Authenticate with device

Once a connection and a credential store is ready, use `AdbDaemonTransport.authenticate` method to initiate the handshake and authenticate with the device.

```ts transpile
import { AdbDaemonTransport } from "@yume-chan/adb";

const transport: AdbDaemonTransport = await AdbDaemonTransport.authenticate({
  serial: device.serial,
  connection,
  credentialStore: CredentialStore,
});
```

:::info

The `serial` field is for bookkeeping purpose. It can be any string if you don't need it.

:::

If the private key is not yet trusted by the device, a dialog will be shown on device screen to let users confirm the connection.

## Create ADB instance

While transports contains the lower-level logic to communicate with devices, the `Adb` class provides a higher-level abstraction over ADB protocol and ADB commands.

This step only initialize some internal states, but does not actually send any packets to the device.

```ts transpile
import { Adb } from "@yume-chan/adb";

const adb: Adb = new Adb(transport);
```

:::note Next Step

See [commands](../commands/overview.md) for how to use the `Adb` instance.

:::
