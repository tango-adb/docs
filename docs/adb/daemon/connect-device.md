---
sidebar_position: 5
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# Connect to device

## Authenticate with device

Once you have a `connection` to the device, you can use `AdbDaemonTransport.authenticate` to initiate the handshake and authenticate with the device.

```ts transpile
import { AdbDaemonTransport } from "@yume-chan/adb";

const transport: AdbDaemonTransport = await AdbDaemonTransport.authenticate({
  serial: device.serial,
  connection,
  credentialStore: CredentialStore,
});
```

This will use the credential store to retrieve or generate a private key, and use it to authenticate with the device.

If the private key is not yet trusted by the device, a dialog will be shown on device screen to let users confirm the connection.

Even if the user checked "Always allow from this computer" in the dialog, the private key may lost trust due to various reasons, such as:

1. On Android 11 or newer, the device will automatically revoke the trust if the private key is not used for 7 days, unless this feature is disabled by the user.
2. On Android 11 or newer, the user can manually revoke the trust for individual private keys in "Settings -> Developer options -> Wireless debugging -> Paired devices".
3. On Android 10 or older, the user can manually revoke all trusts in "Settings -> Developer options -> Revoke USB debugging authorizations".

## Create ADB instance

While transports contains the lower-level logic to communicate with devices, the `Adb` class provides a higher-level abstraction over ADB protocol and ADB commands.

This step only initialize some internal states, but does not actually send any packets to the device.

```ts transpile
import { Adb } from "@yume-chan/adb";

const adb: Adb = new Adb(transport);
```

:::note

**Next Step:** See [commands](../commands/overview.md) for how to use the `Adb` instance.

:::
