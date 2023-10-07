---
sidebar_position: 3
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# Get all connected devices

## Get devices

<Tabs className="runtime-tabs" groupId="runtime">
<TabItem value="web" label="Web">

WebUSB's [`USB#getDevices`](https://developer.mozilla.org/en-US/docs/Web/API/USB/getDevices) method returns all devices that are currently connected and have been granted permission to access by the user.

</TabItem>
<TabItem value="node" label="Node.js">

Previously, we have disabled the permission system in `usb` package's WebUSB implementation, so the [`USB#getDevices`](https://developer.mozilla.org/en-US/docs/Web/API/USB/getDevices) method returns all devices that are currently connected.

</TabItem>
</Tabs>

`USB#getDevices` returns all connected devices, including those that are not ADB devices. So `AdbDaemonWebUsbDeviceManager#getDevices` method calls `USB#getDevices`, picks ADB devices from the results, and wraps them to `AdbDaemonWebUsbDevice` instances.

```ts
interface AdbDeviceFilter {
  classCode: number;
  subclassCode: number;
  protocolCode: number;
  vendorId?: number;
  productId?: number;
  serialNumber?: string;
}

declare class AdbDaemonWebUsbDeviceManager {
  getDevices(filters?: AdbDeviceFilter[]): Promise<AdbDaemonWebUsbDevice[]>;
}
```

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

By default, `AdbDaemonWebUsbDeviceManager#getDevices` method uses a filter that matches the ADB interface:

```ts
export const ADB_DEFAULT_DEVICE_FILTER = {
  classCode: 0xff,
  subclassCode: 0x42,
  protocolCode: 1,
} as const satisfies AdbDeviceFilter;
```

But it also accepts custom filters to limit which devices will be returned. Each filter is an object with the following fields:

- `classCode`: (Required) The class code of the ADB interface.
- `subclassCode`: (Required) The subclass code of the ADB interface.
- `protocolCode`: (Required) The protocol code of the ADB interface.
- `vendorId`: The USB vendor ID of the device.
- `productId`: The USB product ID of the device.
- `serialNumber`: The serial number of the device.

`classCode`, `subclassCode` and `protocolCode` fields are required to ensure the device is an ADB device. They can be different from `ADB_DEFAULT_DEVICE_FILTER` if your device has a different configuration. Tango will use these fields to select the correct interface to communicate with.

`venderId`, `productId` and `serialNumber` fields can be used to select a specific manufacturer, a specific model, or a specific device.

:::info

Some lazy manufacturers use the same `serialNumber` for all devices. So even if `serialNumber` is specified, it's still possible that multiple devices will be returned.

:::

To say a device matches a filter, the device must match all specified fields in the filter.

To say a device matches multiple filters, the device must match at least one of them.

For example, to only allow a specific manufacturer/model:

```ts transpile
import {
  AdbDaemonWebUsbDevice,
  ADB_DEFAULT_DEVICE_FILTER,
} from "@yume-chan/adb-daemon-webusb";

const devices: AdbDaemonWebUsbDevice[] = await Manager.getDevices([
  {
    ...ADB_DEFAULT_DEVICE_FILTER,
    vendorId: 0x18d1,
    productId: 0x4ee2,
  },
]);
```

And to allow multiple manufacturers/models:

```ts transpile
import {
  AdbDaemonWebUsbDevice,
  ADB_DEFAULT_DEVICE_FILTER,
} from "@yume-chan/adb-daemon-webusb";

const devices: AdbDaemonWebUsbDevice[] = await Manager.getDevices([
  {
    ...ADB_DEFAULT_DEVICE_FILTER,
    vendorId: 0x18d1,
    productId: 0x4ee2,
  },
  {
    ...ADB_DEFAULT_DEVICE_FILTER,
    vendorId: 0x04e8,
    productId: 0x6860,
  },
]);
```
