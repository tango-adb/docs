---
sidebar_position: 3
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# Request device permission

## Request permission

:::info

This only applies to browsers. For Node.js, you can skip to the next step.

:::

Access to USB devices in browsers requires user's consent. This method requires [user activation](https://developer.mozilla.org/en-US/docs/Web/Security/User_activation), such as in a click event handler.

```ts transpile
import { AdbDaemonWebUsbDevice } from "@yume-chan/adb-daemon-webusb";

document.getElementById("button").addEventListener("click", () => {
  const device: AdbDaemonWebUsbDevice | undefined =
    await Manager.requestDevice();
  if (!device) {
    alert("No device selected");
    return;
  }
});
```

After calling `requestDevice`, the browser will show a dialog to let users select a device. If the user cancels the dialog, `requestDevice` will return `undefined`.

The permission is persisted by the browser, but the user can revoke the permission in "Settings -> Site Permissions -> USB devices" at any time.

## Drop permission

If a device is connected and the permission to access it was granted, but you don't want to access it anymore, you can drop the permission.

```ts transpile
device.raw.forget();
```

Because there is no way to retrieve permission-granted but disconnected devices (unless you got the `device` before it was disconnected), it's also not possible to drop permissions for them.
