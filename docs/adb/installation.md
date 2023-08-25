---
sidebar_position: 1
---

# Quick Start

<!--
cspell: ignore struct
cspell: ignore webusb
-->

Tango is separated into many packages. For it to work, you need at least two packages:

1. The core [`@yume-chan/adb`](https://www.npmjs.com/package/@yume-chan/adb) package
2. A transport connection to communicate with devices

```
npm i @yume-chan/adb
```

## Working Modes

Tango has two working modes (called `Transport`s). This also affects what type of transport connection package you need.

### Direct Connection Mode

In this mode, Google ADB is not required for Tango to work (in fact, Google ADB must not be running in order to use this mode). Tango communicates with Android devices directly.

This mode is suitable for running on end-users' devices where Google ADB is not installed, or on mobile devices where Google ADB is not available.

To use this mode, you will use the `AdbDaemonTransport` class from `@yume-chan/adb` package, with a daemon connection package, and a credential store package.

#### Daemon Connection Packages

| Connection | Browser                           | Node.js                               |
| ---------- | --------------------------------- | ------------------------------------- |
| USB        | `npm i @yume-chan/adb-daemon-usb` | `npm i @yume-chan/adb-daemon-usb usb` |
| TCP        | TODO                              | TODO                                  |

#### Credential Store

| Browser                         | Node.js       |
| ------------------------------- | ------------- |
| `@yume-chan/adb-credential-web` | See Next Step |

#### Next Step

| Connection | Browser                                | Node.js                             |
| ---------- | -------------------------------------- | ----------------------------------- |
| USB        | [Connect to devices](./daemon/browser) | [Connect to devices](./daemon/node) |
| TCP        | TODO                                   | TODO                                |

### Google ADB Client Mode

In this mode, Tango talks to a Google ADB server, which is either running on the same machine or on a remote machine. This allows other ADB-based tools (e.g. Android Studio, Scrcpy) to work alongside Tango.

To use this mode, you will use the `AdbServerTransport` class from `@yume-chan/adb` package, with a server connection package.

#### Server Connection Packages

| Connection | Browser | Node.js                          |
| ---------- | ------- | -------------------------------- |
| TCP        | TODO    | `@yume-chan/adb-server-node-tcp` |

#### Connect to local ADB server

```ts
import { Adb, AdbServerClient } from "@yume-chan/adb";
import { AdbServerNodeTcpConnection } from "@yume-chan/adb-server-node-tcp";

const connection = new AdbServerNodeTcpConnection({
  host: "localhost",
  port: 5037,
});
const client = new AdbServerClient(connection);
const devices = await client.getDevices();

for (const device of devices) {
  const result = await device.subprocess.spawnAndWait("echo 'Hello, World!'");
}
```
