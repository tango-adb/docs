---
sidebar_position: 4
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# Get all connected devices

If a device is connected and the permission to access it was granted, it can be accessed again without user interaction.

```ts transpile
import { AdbDaemonWebUsbDevice } from "@yume-chan/adb-daemon-webusb";

const devices: AdbDaemonWebUsbDevice[] = await Manager.getDevices();
if (!devices.length) {
  alert("No device connected");
  return;
}

const device: AdbDaemonWebUsbDevice = devices[0];
```
