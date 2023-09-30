---
sidebar_position: 5
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# Connect to device

## Open a connection

Only one process across the whole operating system can access a USB device at a time, and only one tab in a browser can access a USB device at a time. That's why Tango doesn't work with Google ADB in direct connection mode.

Requesting permission to a device doesn't automatically request the exclusive access. You need to call `connect` to do it.

```ts transpile
import { AdbPacketData, AdbPacketInit } from "@yume-chan/adb";
import { Consumable, ReadableWritablePair } from "@yume-chan/stream-extra";

const connection: ReadableWritablePair<
  AdbPacketData,
  Consumable<AdbPacketInit>
> = await device.connect();
```

The connection might fail due to various reasons, such as:

1. Another process (e.g. Google ADB, another browser) already has the exclusive access to the device. Google ADB might be indirectly started by other tools, such as Android Studio, Visual Studio with Mobile development workloads, Godot Editor, Scrcpy...
2. Another browser tab already has the exclusive access to the device. Such as another instance of your app, or another app that uses Tango or WebUSB.
3. The device is disconnected between `requestDevice` and `connect`.

## Authenticate with device

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

**Next Step:** See [commands](../commands/overview.md) for how to use the `Adb` instance.
