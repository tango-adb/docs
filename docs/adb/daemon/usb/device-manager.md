---
sidebar_position: 1
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# Get device manager

`@yume-chan/adb-daemon-webusb` package provides an abstraction over [WebUSB](https://wicg.github.io/webusb/) API. It can use varies WebUSB compatible implementations.

<Tabs className="runtime-tabs" groupId="runtime">
<TabItem value="web" label="Web">

In supported Web browsers, you can use the native implementation.

:::info

Electron renderer process does have WebUSB API, but it doesn't have the same permission system as browsers.

See https://www.electronjs.org/docs/latest/tutorial/devices#webusb-api for how to use WebUSB in Electron.

:::

```ts transpile
import { AdbDaemonWebUsbDeviceManager } from "@yume-chan/adb-daemon-webusb";

const Manager: AdbDaemonWebUsbDeviceManager | undefined =
  AdbDaemonWebUsbDeviceManager.BROWSER;
```

:::info

`AdbDaemonWebUsbDeviceManager.BROWSER` is a shortcut for `navigator.usb ? new AdbDaemonWebUsbDeviceManager(navigator.usb) : undefined`.

:::

You should check if `Manager` is `undefined`:

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

`usb` package provides a WebUSB compatible implementation for Node.js.

```ts transpile
import { AdbDaemonWebUsbDeviceManager } from "@yume-chan/adb-daemon-webusb";
import { WebUSB } from "usb";

const WebUsb: WebUSB = new WebUSB({ allowAllDevices: true });
const Manager: AdbDaemonWebUsbDeviceManager = new AdbDaemonWebUsbDeviceManager(
  WebUsb,
);
```

:::info

Passing the `allowAllDevices: true` option disables the permission system and returns all available devices from `getDevices` methods.

:::

</TabItem>
</Tabs>
