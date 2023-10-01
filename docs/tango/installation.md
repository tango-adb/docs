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

<Tabs className="runtime-tabs" groupId="runtime">
<TabItem value="web" label="Web">
<Tabs className="runtime-tabs" groupId="direct-connection">
<TabItem value="usb" label="USB">

The [`@yume-chan/adb-daemon-usb`](https://www.npmjs.com/package/@yume-chan/adb-daemon-usb) package provides a daemon connection that uses [WebUSB API](https://developer.mozilla.org/en-US/docs/Web/API/WebUSB_API).

```sh npm2yarn
npm i @yume-chan/adb-daemon-usb
```

</TabItem>
<TabItem value="tcp" label="TCP">

Currently there is no Web API that allows TCP connection. Looking forward to the [Direct Socket API](https://github.com/WICG/direct-sockets).

</TabItem>
</Tabs>

The [`@yume-chan/adb-credential-web`](https://www.npmjs.com/package/@yume-chan/adb-credential-web) package provides a credential store that works in browsers.

```sh npm2yarn
npm i @yume-chan/adb-credential-web
```

</TabItem>
<TabItem value="node" label="Node.js">
<Tabs className="runtime-tabs" groupId="direct-connection">
<TabItem value="usb" label="USB">

The [`@yume-chan/adb-daemon-usb`](https://www.npmjs.com/package/@yume-chan/adb-daemon-usb) package provides a daemon connection that uses [WebUSB API](https://developer.mozilla.org/en-US/docs/Web/API/WebUSB_API).

The [`usb`](https://www.npmjs.com/package/usb) package provides a WebUSB implementation for Node.js.

```sh npm2yarn
npm i @yume-chan/adb-daemon-usb usb
```

We will create a credential store manually, so you don't need a package for that.

</TabItem>
<TabItem value="tcp" label="TCP">

We will use the built-in `net` module to create TCP connections, and create other parts manually, so don't need any additional package.

</TabItem>
</Tabs>
</TabItem>
</Tabs>

You can also create your own daemon connection and credential store. You will see how to do this in next steps.

:::note Next Step

[Connect to device](./daemon/credential-store.md)

:::

## Google ADB Client Transport

In this mode, Tango talks to a Google ADB server, which can either run on the same machine or on a remote machine. This allows Tango to work with other ADB-based tools (e.g. ADB client, Android Studio, Scrcpy, etc.).

To use this mode, you will use the `AdbServerTransport` class from `@yume-chan/adb` package, with a server connection.

<Tabs className="runtime-tabs" groupId="runtime">
<TabItem value="web" label="Web">

Currently there is no Web API that allows TCP connection. Looking forward to the [Direct Socket API](https://github.com/WICG/direct-sockets).

</TabItem>
<TabItem value="node" label="Node.js">

The [@yume-chan/adb-server-node-tcp](https://www.npmjs.com/package/@yume-chan/adb-server-node-tcp) package provides a server connection based on Node.js built-in `net` module.

```sh npm2yarn
npm i @yume-chan/adb-server-node-tcp
```

Example:

```ts transpile
import { Adb, AdbServerClient } from "@yume-chan/adb";
import { AdbServerNodeTcpConnection } from "@yume-chan/adb-server-node-tcp";

const connection: AdbServerNodeTcpConnection = new AdbServerNodeTcpConnection({
  host: "localhost",
  port: 5037,
});
const client: AdbServerClient = new AdbServerClient(connection);
const devices: Adb[] = await client.getDevices();

for (const device of devices) {
  const result = await device.subprocess.spawnAndWait("echo 'Hello, World!'");
}
```

</TabItem>
</Tabs>
