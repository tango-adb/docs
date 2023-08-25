---
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Connect to devices (Web Browsers)

Tango supports connecting to USB devices in web browsers using [WebUSB](https://wicg.github.io/webusb/) API.

## Step-by-step explanation

### Create a credential store

Directly connecting to devices requires authentication. ADB uses RSA algorithm to identify clients.

<Tabs groupId="code">
<TabItem value="js" label="JavaScript">

```ts
import AdbWebCredentialStore from "@yume-chan/adb-credential-web";

const CredentialStore = new AdbWebCredentialStore();
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts
import AdbWebCredentialStore from "@yume-chan/adb-credential-web";

const CredentialStore: AdbWebCredentialStore = new AdbWebCredentialStore();
```

</TabItem>
</Tabs>

`@yume-chan/adb-credential-web` package uses [Web Crypto](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) API to generate ADB private keys, and uses [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) API to store them.

Optionally, you can provide a name for your keys. On devices with Android 11 or newer, it will appear in "Settings -> Developer options -> Wireless debugging -> Paired devices".

<Tabs groupId="code">
<TabItem value="js" label="JavaScript">

```ts
import AdbWebCredentialStore from "@yume-chan/adb-credential-web";

const CredentialStore = new AdbWebCredentialStore("Your Key Name");
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts
import AdbWebCredentialStore from "@yume-chan/adb-credential-web";

const CredentialStore: AdbWebCredentialStore = new AdbWebCredentialStore(
  "Your Key Name"
);
```

</TabItem>
</Tabs>

### Get device manager

<Tabs groupId="code">
<TabItem value="js" label="JavaScript">

```ts
import { AdbDaemonWebUsbDeviceManager } from "@yume-chan/adb-daemon-webusb";

const Manager = AdbDaemonWebUsbDeviceManager.BROWSER;
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts
import { AdbDaemonWebUsbDeviceManager } from "@yume-chan/adb-daemon-webusb";

const Manager: AdbDaemonWebUsbDeviceManager | undefined =
  AdbDaemonWebUsbDeviceManager.BROWSER;
```

</TabItem>
</Tabs>

`@yume-chan/adb-daemon-webusb` package provides an abstraction over WebUSB API. It can use varies WebUSB compatible implementations.

```ts
AdbDaemonWebUsbDeviceManager.BROWSER;
```

is a shorthand for

```ts
new AdbDaemonWebUsbDeviceManager(navigator.usb);
```

### Check browser compatibility

<Tabs groupId="code">
<TabItem value="js" label="JavaScript">

```ts
if (!Manager) {
  alert("WebUSB is not supported in this browser");
  return;
}
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts
if (!Manager) {
  alert("WebUSB is not supported in this browser");
  return;
}
```

</TabItem>
</Tabs>

There are two reasons that `Manager` may be `undefined`:

1. The browser does not support WebUSB API
2. The current page isn't in a [Secure Context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts) (HTTPS or localhost)

### Request permission to access a device

Access to USB devices in browsers requires user's consent. This method requires [user activation](https://developer.mozilla.org/en-US/docs/Web/Security/User_activation), such as in a click event handler.

<Tabs groupId="code">
<TabItem value="js" label="JavaScript">

```ts
const device = await Manager.requestDevice();
if (!device) {
  alert("No device selected");
  return;
}
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts
import { AdbDaemonWebUsbDevice } from "@yume-chan/adb-daemon-webusb";

const device: AdbDaemonWebUsbDevice | undefined = await Manager.requestDevice();
if (!device) {
  alert("No device selected");
  return;
}
```

</TabItem>
</Tabs>

After calling `requestDevice`, the browser will show a dialog to let users select a device. If the user cancels the dialog, `requestDevice` will return `undefined`.

The permission is persisted by the browser, but the user can revoke the permission in "Settings -> Site Permissions -> USB devices" at any time.

### Get all connected devices

If a device is connected and the permission to access it was granted, it can be accessed again without user interaction.

While `navigator.usb.getDevices()` returns all available USB devices, `AdbDaemonWebUsbDeviceManager.getDevices()` picks ADB devices only.

<Tabs groupId="code">
<TabItem value="js" label="JavaScript">

```ts
const devices = await Manager.getDevices();

if (!devices.length) {
  alert("No device connected");
  return;
}

const device = devices[0];
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts
import { AdbDaemonWebUsbDevice } from "@yume-chan/adb-daemon-webusb";

const devices: AdbDaemonWebUsbDevice[] = await Manager.getDevices();
if (!devices.length) {
  alert("No device connected");
  return;
}

const device: AdbDaemonWebUsbDevice = devices[0];
```

</TabItem>
</Tabs>

### Open a connection to device

Only one process across the whole operating system can access a USB device at a time, and only one tab in a browser can access a USB device at a time. That's why Tango doesn't work with Google ADB in direct connection mode.

Requesting permission to a device doesn't automatically request the exclusive access. You need to call `connect` to do it.

<Tabs groupId="code">
<TabItem value="js" label="JavaScript">

```ts
const connection = await device.connect();
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts
import { AdbPacketData, AdbPacketInit } from "@yume-chan/adb";
import { Consumable, ReadableWritablePair } from "@yume-chan/stream-extra";

const connection: ReadableWritablePair<
  AdbPacketData,
  Consumable<AdbPacketInit>
> = await device.connect();
```

</TabItem>
</Tabs>

The connection might fail due to various reasons, such as:

1. Another process (e.g. Google ADB, another browser) already has the exclusive access to the device. Google ADB might be indirectly started by other tools, such as Android Studio, Visual Studio with Mobile development workloads, Godot Editor, Scrcpy...
2. Another browser tab already has the exclusive access to the device. Such as another instance of your app, or another app that uses Tango or WebUSB.
3. The device is disconnected between `requestDevice` and `connect`.

### Authenticate with device

<Tabs groupId="code">
<TabItem value="js" label="JavaScript">

```ts
import { AdbDaemonTransport } from "@yume-chan/adb";

const transport = await AdbDaemonTransport.authenticate({
  serial: device.serial,
  connection,
  credentialStore: CredentialStore,
});
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts
import { AdbDaemonTransport } from "@yume-chan/adb";

const transport: AdbDaemonTransport = await AdbDaemonTransport.authenticate({
  serial: device.serial,
  connection,
  credentialStore: CredentialStore,
});
```

</TabItem>
</Tabs>

This will use the credential store to retrieve or generate a private key, and use it to authenticate with the device.

If the private key is not yet trusted by the device, a dialog will be shown on device screen to let users confirm the connection.

Even if the user checked "Always allow from this computer" in the dialog, the private key may lost trust due to various reasons, such as:

1. On Android 11 or newer, the device will automatically revoke the trust if the private key is not used for 7 days, unless this feature is disabled by the user.
2. On Android 11 or newer, the user can manually revoke the trust for individual private keys in "Settings -> Developer options -> Wireless debugging -> Paired devices".
3. On Android 10 or older, the user can manually revoke all trusts in "Settings -> Developer options -> Revoke USB debugging authorizations".

### Create ADB instance

<Tabs groupId="code">
<TabItem value="js" label="JavaScript">

```ts
import { Adb } from "@yume-chan/adb";

const adb = new Adb(transport);
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts
import { Adb } from "@yume-chan/adb";

const adb = new Adb(transport);
```

</TabItem>
</Tabs>

Transports contains the lower-level logic to communicate with devices. `Adb` class provides a higher-level abstraction over ADB protocol and ADB commands.

## Complete example

<Tabs groupId="code">
<TabItem value="js" label="JavaScript">

```ts
import { Adb, AdbDaemonTransport } from "@yume-chan/adb";
import AdbWebCredentialStore from "@yume-chan/adb-credential-web";
import { AdbDaemonWebUsbDeviceManager } from "@yume-chan/adb-daemon-webusb";

const CredentialStore = new AdbWebCredentialStore();

const Manager = AdbDaemonWebUsbDeviceManager.BROWSER;

if (!Manager) {
  alert("WebUSB is not supported in this browser");
  return;
}

const device = await Manager.requestDevice();
if (!device) {
  alert("No device selected");
  return;
}

const connection = await device.connect();

const transport = await AdbDaemonTransport.authenticate({
  serial: device.serial,
  connection,
  credentialStore: CredentialStore,
});

const adb = new Adb(transport);
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts
import {
  Adb,
  AdbDaemonTransport,
  AdbPacketData,
  AdbPacketInit,
} from "@yume-chan/adb";
import AdbWebCredentialStore from "@yume-chan/adb-credential-web";
import {
  AdbDaemonWebUsbDevice,
  AdbDaemonWebUsbDeviceManager,
} from "@yume-chan/adb-daemon-webusb";
import { Consumable, ReadableWritablePair } from "@yume-chan/stream-extra";

const CredentialStore: AdbWebCredentialStore = new AdbWebCredentialStore();

const Manager: AdbDaemonWebUsbDeviceManager | undefined =
  AdbDaemonWebUsbDeviceManager.BROWSER;

if (!Manager) {
  alert("WebUSB is not supported in this browser");
  return;
}

const device: AdbDaemonWebUsbDevice | undefined = await Manager.requestDevice();
if (!device) {
  alert("No device selected");
  return;
}

const connection: ReadableWritablePair<
  AdbPacketData,
  Consumable<AdbPacketInit>
> = await device.connect();

const transport: AdbDaemonTransport = await AdbDaemonTransport.authenticate({
  serial: device.serial,
  connection,
  credentialStore: CredentialStore,
});

const adb = new Adb(transport);
```

</TabItem>
</Tabs>

## Discard a permission

If a device is connected and the permission to access it was granted, but you don't want to access it anymore, you can discard the permission.

<Tabs groupId="code">
<TabItem value="js" label="JavaScript">

```ts
device.raw.forget();
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts
device.raw.forget();
```

</TabItem>
</Tabs>

Because there is no way to retrieve permission-granted but disconnected devices (unless you got the `device` before it was disconnected), it's also not possible to discard permissions for them.

## Next Step

- [Run commands](../commands/overview)
