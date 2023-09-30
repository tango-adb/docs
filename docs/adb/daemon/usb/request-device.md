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

In Web browsers, each website needs to request the permission to access each device separately using WebUSB's [`USB#requestDevice`](https://wicg.github.io/webusb/#dom-usb-requestdevice) method. The `AdbDaemonWebUsbDeviceManager#requestDevice` method wraps that method, passes filters for ADB devices, and converts results to `AdbDaemonWebUsbDevice` instances.

`requestDevice` requires [user activation](https://developer.mozilla.org/en-US/docs/Web/Security/User_activation), which means it can only be called in response to a mouse click or keyboard press event.

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

After calling `requestDevice`, the browser shows a list of Android device to the user. The user can pick one device from the list, and `requestDevice` will return that device. If the user didn't pick any device, `requestDevice` will return `undefined`.

The permission is persisted by the browser, so from next time, the website can access the device without user consent. However, the user can revoke the permission in "Settings -> Site Permissions -> USB devices" at any time.

## Filter devices to be chosen from

By default, `requestDevice` method passes filters for ADB devices, but custom filters can be provided to limit which devices will appear in the browser presented list. Each filter is an object with the following fields:

- `classCode`: (Required) The class code of the ADB interface.
- `subclassCode`: (Required) The subclass code of the ADB interface.
- `protocolCode`: (Required) The protocol code of the ADB interface.
- `vendorId`: The USB vendor ID of the device.
- `productId`: The USB product ID of the device.
- `serialNumber`: The serial number of the device.

`classCode`, `subclassCode` and `protocolCode` fields are required to instruct Tango which interface to claim. Other fields are optional, to further filter the list.

For example, to only allow devices from a specific manufacturer:

```ts transpile
import {
  AdbDaemonWebUsbDevice,
  ADB_DEFAULT_DEVICE_FILTER,
} from "@yume-chan/adb-daemon-webusb";

const device: AdbDaemonWebUsbDevice | undefined = await Manager.requestDevice([
  {
    ...ADB_DEFAULT_DEVICE_FILTER,
    vendorId: 0x18d1,
  },
]);
```

:::info

The `ADB_DEFAULT_DEVICE_FILTER` constant has the default values of `classCode`, `subclassCode` and `protocolCode` fields for ADB interface. If your device's ADB interface has different values, you need to provide your own filter.

:::

When multiple filters are provided, devices matching any of them will appear in the list. For example, to allow devices from multiple manufacturers:

```ts transpile
import {
  AdbDaemonWebUsbDevice,
  ADB_DEFAULT_DEVICE_FILTER,
} from "@yume-chan/adb-daemon-webusb";

const device: AdbDaemonWebUsbDevice | undefined = await Manager.requestDevice([
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

## Drop permission

If a device is connected and the permission to access it was granted, but you don't want to access it anymore, you can drop the permission.

```ts transpile
device.raw.forget();
```

Because there is no way to retrieve permission-granted but disconnected devices (unless you got the `device` before it was disconnected), it's also not possible to drop permissions for them.
