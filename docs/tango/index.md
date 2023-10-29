---
sidebar_position: 1
slug: /
---

# Quick Start

<!--
cspell: ignore struct
cspell: ignore webusb
-->

Tango is separated into many packages. Generally, you need at least three things:

1. [`@yume-chan/adb`](https://www.npmjs.com/package/@yume-chan/adb): The core package
2. [`@yume-chan/stream-extra`](https://www.npmjs.com/package/@yume-chan/stream-extra): Polyfill for [Web Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API) and utilities for streams
3. A transport object to communicate with devices

```sh npm2yarn
npm i @yume-chan/adb @yume-chan/stream-extra
```

## Direct Connection Transport

In this mode, Google ADB is not required for Tango to work (for USB connections, Google ADB must not be running). Tango communicates with Android devices directly.

This mode is suitable for running on end-users' devices where Google ADB is not installed, or on mobile devices where Google ADB is not available.

To use this mode, you will use the `AdbDaemonTransport` class from `@yume-chan/adb` package, with a daemon connection and a credential store.

<Tabs className="runtime-tabs" groupId="direct-connection">
<TabItem value="usb" label="USB">

:::note Next Step

[Create USB connection](./daemon/usb/device-manager.md)

:::

</TabItem>
<TabItem value="tcp" label="TCP">

:::note Next Step

[Create TCP connection](./daemon/tcp/enable.md)

:::

</TabItem>
<TabItem value="custom" label="Custom">

:::note Next Step

[Create custom connection](./daemon/custom-connection.md)

:::

</TabItem>
</Tabs>

## Google ADB Client Transport

In this mode, Tango talks to a Google ADB server, which can either run on the same machine or on a remote machine. This allows Tango to work with other ADB-based tools (e.g. ADB client, Android Studio, Scrcpy, etc.).

To use this mode, you will use the `AdbServerClient` class from `@yume-chan/adb` package, with a server connection.

:::note Next Step

[Connect to server](./server/connection.md)

:::

## Custom Transport

It's also possible to create a custom transport. For example, a mock transport can be used in tests, or a proxy transport can share a device with multiple clients.

:::note Next Step

[Create custom transport](./custom-transport.md)

:::