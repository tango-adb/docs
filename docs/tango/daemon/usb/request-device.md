---
sidebar_position: 2
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# Request device permission

:::note

This page only applies to browsers. For Node.js, you can skip to the [next step](./get-devices.md).

:::

## Request permission

In Web browsers, each website needs to request the permission to access each device separately using WebUSB's [`USB#requestDevice`](https://developer.mozilla.org/en-US/docs/Web/API/USB/requestDevice) method. The `AdbDaemonWebUsbDeviceManager#requestDevice` method calls `USB#requestDevice` and wraps the result to an `AdbDaemonWebUsbDevice` instance.

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
  requestDevice(
    filters?: AdbDeviceFilter[],
  ): Promise<AdbDaemonWebUsbDevice | undefined>;
}
```

`USB#requestDevice` method requires [user activation](https://developer.mozilla.org/en-US/docs/Web/Security/User_activation), which means it can only be called in response to a mouse click or keyboard press event.

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

When calling `USB#requestDevice`, the browser shows a list of connected devices to the user. The user can pick one device from the list, and `requestDevice` will return that device. If the user closes the picker without selecting any device, `requestDevice` will return `undefined`.

The permission is persisted by the browser, so from next time, the website can access that device without calling `requestDevice` again. However, the user can revoke the permission in "Settings -> Site Permissions -> USB devices" at any time.

## Filter devices to be chosen from

`USB#requestDevice` method takes a list of filters to limit which devices will appear in the browser presented list. By default, `AdbDaemonWebUsbDeviceManager#requestDevice` method uses a filter that matches the ADB interface:

```ts
export const ADB_DEFAULT_DEVICE_FILTER = {
  classCode: 0xff,
  subclassCode: 0x42,
  protocolCode: 1,
} as const satisfies AdbDeviceFilter;
```

But it also accepts custom filters. Each filter is an object with the following fields:

- `classCode`: (Required) The class code of the ADB interface.
- `subclassCode`: (Required) The subclass code of the ADB interface.
- `protocolCode`: (Required) The protocol code of the ADB interface.
- `vendorId`: The USB vendor ID of the device.
- `productId`: The USB product ID of the device.
- `serialNumber`: The serial number of the device.

`classCode`, `subclassCode` and `protocolCode` fields are required to ensure the device is an ADB device. They can be different from `ADB_DEFAULT_DEVICE_FILTER` if your device has a different configuration. Tango will use these fields to select the correct interface to communicate with.

`venderId`, `productId` and `serialNumber` fields can be used to select a specific manufacturer, a specific model, or a specific device.

To say a device matches a filter, the device must match all specified fields in the filter.

To say a device matches multiple filters, the device must match at least one of them.

For example, to only allow a specific manufacturer/model:

```ts transpile
import {
  AdbDaemonWebUsbDevice,
  ADB_DEFAULT_DEVICE_FILTER,
} from "@yume-chan/adb-daemon-webusb";

const device: AdbDaemonWebUsbDevice | undefined = await Manager.requestDevice([
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

const device: AdbDaemonWebUsbDevice | undefined = await Manager.requestDevice([
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

## Drop permission

If a device is connected and the permission to access it was granted, but you don't want to access it anymore, you can drop the permission.

```ts transpile
device.raw.forget();
```

Because there is no way to retrieve permission-granted but disconnected devices (unless you got the `device` before it was disconnected), it's also not possible to drop permissions for them. (See https://github.com/WICG/webusb/issues/166)
