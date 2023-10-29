---
sidebar_position: 1
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# Get device manager

[`@yume-chan/adb-daemon-webusb`](https://www.npmjs.com/package/@yume-chan/adb-daemon-webusb) package provides an `AdbDaemonConnection` using [WebUSB API](https://developer.mozilla.org/en-US/docs/Web/API/WebUSB_API). It can use varies WebUSB compatible implementations.

```sh npm2yarn
npm i @yume-chan/adb-daemon-webusb
```

<Tabs className="runtime-tabs" groupId="runtime">
<TabItem value="web" label="Web">

WebUSB API is natively supported in Chromium-based browsers.

:::info Electron Support

* To use Tango in Electron renderer processes, see https://www.electronjs.org/docs/latest/tutorial/devices#webusb-api for how to enable WebUSB API, then follow the below instructions
* To use Tango in Electron main processes, follow the instructions for Node.js instead

:::

Create a device manager for browsers:

```ts transpile
import { AdbDaemonWebUsbDeviceManager } from "@yume-chan/adb-daemon-webusb";

const Manager: AdbDaemonWebUsbDeviceManager | undefined =
  AdbDaemonWebUsbDeviceManager.BROWSER;
```

:::info

`AdbDaemonWebUsbDeviceManager.BROWSER` is a shortcut for `navigator.usb ? new AdbDaemonWebUsbDeviceManager(navigator.usb) : undefined`.

:::

Check if `Manager` is `undefined`:

```ts transpile
if (!Manager) {
  alert("WebUSB is not supported in this browser");
  return;
}
```

There are two reasons that `Manager` may be `undefined`:

1. The browser does not support WebUSB API
2. The current page isn't in a [Secure Context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts) (HTTPS or localhost)

</TabItem>
<TabItem value="node" label="Node.js">

[`usb`](https://www.npmjs.com/package/usb) package provides a WebUSB compatible implementation for Node.js.

```sh npm2yarn
npm i usb
```

Create a device manager using `WebUSB` from `usb` package:

```ts transpile
import { AdbDaemonWebUsbDeviceManager } from "@yume-chan/adb-daemon-webusb";
import { WebUSB } from "usb";

const WebUsb: WebUSB = new WebUSB({ allowAllDevices: true });
const Manager: AdbDaemonWebUsbDeviceManager = new AdbDaemonWebUsbDeviceManager(
  WebUsb,
);
```

:::info

By default, `WebUSB` from `usb` package has the same permission system as browsers:

* Each device must be authorized separately using `requestDevice` method and a custom `devicesFound` callback
* `getDevices` method only returns devices that have been authorized

Passing the `allowAllDevices: true` option disables the permission system and returns all connected devices from `getDevices` methods.

:::

</TabItem>
</Tabs>
