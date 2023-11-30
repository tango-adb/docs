---
sidebar_position: 4
---

# Create connection

USB devices can have multiple interfaces, each for a different function. For example, an Android device can have an ADB interface (when USB debugging is enabled), an MTP interface (when file transferring is enabled), and an [AoA](https://source.android.com/docs/core/interaction/accessories/protocol) interface (when accessory mode is enabled).

To use an interface, it needs to be claimed to gain exclusive access. This means:

* If Google ADB has already claimed the ADB interface, WebUSB API in Chrome can't claim it again.
* If one WebUSB [`USBDevice`](https://developer.mozilla.org/en-US/docs/Web/API/USBDevice) instance has already claimed an interface, other `USBDevice` instances can't claim it again.

Requesting permission to a device doesn't automatically request the exclusive access. The `connect` method wraps WebUSB's [`USBDevice#open`](https://developer.mozilla.org/en-US/docs/Web/API/USBDevice/open) and [`USBDevice#claimInterface`](https://developer.mozilla.org/en-US/docs/Web/API/USBDevice/claimInterface) methods, and converts between raw bytes and ADB packets.

```ts transpile
import { AdbPacketData, AdbPacketInit } from "@yume-chan/adb";
import { Consumable, ReadableWritablePair } from "@yume-chan/stream-extra";

const connection: ReadableWritablePair<
  AdbPacketData,
  Consumable<AdbPacketInit>
> = await device.connect();
```

The connection might fail due to various reasons, such as:

1. Another process (e.g. Google ADB, another browser) already has the exclusive access to the interface. Google ADB might be indirectly started by other programs, such as Android Studio, Visual Studio with Mobile development workloads, Godot Editor, Scrcpy, etc.
2. Another `USBDevice` instance already has the exclusive access to the interface. Such as another instance of your app, or another app that uses Tango or WebUSB.
3. The device is disconnected between `requestDevice` and `connect`.

:::note[Next Step]

[Create credential store](../credential-store.md)

:::
