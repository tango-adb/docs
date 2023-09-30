---
sidebar_position: 3
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# Get all connected devices

## Get devices

<Tabs className="runtime-tabs" groupId="runtime">
<TabItem value="web" label="Web">

WebUSB's [`USB#getDevices`](https://wicg.github.io/webusb/#dom-usb-getdevices) method returns all devices that are currently connected and have been granted permission to access by the user.

</TabItem>
<TabItem value="node" label="Node.js">

Previously, we have disabled the permission system in `usb` package's WebUSB implementation, so the [`USB#getDevices`](https://wicg.github.io/webusb/#dom-usb-getdevices) method returns all devices that are currently connected.

</TabItem>
</Tabs>

`AdbDaemonWebUsbDeviceManager#getDevices` method wraps that, filters out devices that are not ADB devices, and converts results to `AdbDaemonWebUsbDevice` instances.

```ts transpile
import { AdbDaemonWebUsbDevice } from "@yume-chan/adb-daemon-webusb";

const devices: AdbDaemonWebUsbDevice[] = await Manager.getDevices();
if (!devices.length) {
  alert("No device connected");
  return;
}

const device: AdbDaemonWebUsbDevice = devices[0];
```

## Filter connected devices

By default, `getDevices` method only returns devices with ADB interface, but custom filters can be provided to limit which devices will be returned. Each filter is an object with the following fields:

- `classCode`: (Required) The class code of the ADB interface.
- `subclassCode`: (Required) The subclass code of the ADB interface.
- `protocolCode`: (Required) The protocol code of the ADB interface.
- `vendorId`: The USB vendor ID of the device.
- `productId`: The USB product ID of the device.
- `serialNumber`: The serial number of the device.

`classCode`, `subclassCode` and `protocolCode` fields are required to instruct Tango which interface to claim. Other fields are optional, to further filter the list.

For example, to only return devices from a specific manufacturer:

```ts transpile
import {
  AdbDaemonWebUsbDevice,
  ADB_DEFAULT_DEVICE_FILTER,
} from "@yume-chan/adb-daemon-webusb";

const devices: AdbDaemonWebUsbDevice[] = await Manager.getDevices([
  {
    ...ADB_DEFAULT_DEVICE_FILTER,
    vendorId: 0x18d1,
  },
]);
```

:::info

The `ADB_DEFAULT_DEVICE_FILTER` constant has the default values of `classCode`, `subclassCode` and `protocolCode` fields for ADB interface. If your device's ADB interface has different values, you need to provide your own filter.

:::

When multiple filters are provided, devices matching any of them will be returned. For example, to return devices from multiple manufacturers:

```ts transpile
import {
  AdbDaemonWebUsbDevice,
  ADB_DEFAULT_DEVICE_FILTER,
} from "@yume-chan/adb-daemon-webusb";

const devices: AdbDaemonWebUsbDevice[] = await Manager.getDevices([
  {
    ...ADB_DEFAULT_DEVICE_FILTER,
    vendorId: 0x18d1,
  },
  {
    ...ADB_DEFAULT_DEVICE_FILTER,
    vendorId: 0x04e8,
  },
]);
```
