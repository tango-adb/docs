---
sidebar_position: 1
slug: ./
---

# Quick Start

<!--
cspell: ignore struct
cspell: ignore webusb
-->

Tango is separated into many packages. Generally, you need at least three packages:

1. The core [`@yume-chan/adb`](https://www.npmjs.com/package/@yume-chan/adb) package
2. Polyfill for Web Stream API and utilities for streams [`@yume-chan/stream-extra`](https://www.npmjs.com/package/@yume-chan/stream-extra)
3. A transport object to communicate with devices

```sh npm2yarn
npm i @yume-chan/adb @yume-chan/stream-extra
```

## Direct Connection Transport

In this mode, Google ADB is not required for Tango to work (in fact, Google ADB must not be running in order to use this mode). Tango communicates with Android devices directly.

This mode is suitable for running on end-users' devices where Google ADB is not installed, or on mobile devices where Google ADB is not available.

To use this mode, you will use the `AdbDaemonTransport` class from `@yume-chan/adb` package, with a daemon connection package, and a credential store package.

<Tabs className="runtime-tabs" groupId="runtime">
<TabItem value="web" label="Web">

```sh npm2yarn
npm i @yume-chan/adb-daemon-usb @yume-chan/adb-credential-web
```

</TabItem>
<TabItem value="node" label="Node.js">

```sh npm2yarn
npm i @yume-chan/adb-daemon-usb usb
```

</TabItem>
</Tabs>

**Next Step:** [Connect to devices](./daemon/credential-store.md)

## Google ADB Client Transport

In this mode, Tango talks to a Google ADB server, which can either run on the same machine or on a remote machine. This allows Tango to work with other ADB-based tools (e.g. ADB client, Android Studio, Scrcpy, etc.).

To use this mode, you will use the `AdbServerTransport` class from `@yume-chan/adb` package, with a server connection package.

<Tabs className="runtime-tabs" groupId="runtime">
<TabItem value="web" label="Web">

Currently there is no Web API that allows TCP connection. Looking forward to the [Direct Socket API](https://github.com/WICG/direct-sockets).

</TabItem>
<TabItem value="node" label="Node.js">

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
