---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Connect to devices (Node.js)

Tango supports connecting to USB devices in Node.js using the [usb](https://www.npmjs.com/package/usb) package.

## Step-by-step explanation

### Create a credential store

Directly connecting to devices requires authentication. ADB uses RSA algorithm to identify clients.

There is no NPM package for a Node.js compatible credential store, but here is a reference implementation:

<Tabs groupId="code">
<TabItem value="js" label="JavaScript">

```ts
class AdbNodeJsCredentialStore {
  #name;

  constructor(name) {
    this.#name = name;
  }

  #privateKeyPath() {
    return join(homedir(), ".android", "adbkey");
  }

  #publicKeyPath() {
    return join(homedir(), ".android", "adbkey.pub");
  }

  async generateKey() {
    const { privateKey: cryptoKey } = await webcrypto.subtle.generateKey(
      {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 2048,
        // 65537
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: "SHA-1",
      },
      true,
      ["sign", "verify"]
    );

    const privateKey = new Uint8Array(
      await crypto.subtle.exportKey("pkcs8", cryptoKey)
    );
    await writeFile(
      this.#privateKeyPath(),
      Buffer.from(privateKey).toString("utf8")
    );
    await writeFile(
      this.#publicKeyPath(),
      `${Buffer.from(adbGeneratePublicKey(privateKey)).toString("base64")} ${
        this.#name
      }\n`
    );

    return {
      buffer: privateKey,
      name: this.#name,
    };
  }

  async #readPubKeyName() {
    const content = await readFile(this.#publicKeyPath(), "utf8");
    const pubKeyName = content.split(" ")[1];
    return pubKeyName || `${userInfo().username}@${hostname()}`;
  }

  async *iterateKeys() {
    const content = await readFile(this.#privateKeyPath(), "utf8");
    const privateKey = Buffer.from(
      content.split("\n").slice(1, -2).join(""),
      "base64"
    );
    yield {
      buffer: privateKey,
      name: await this.#readPubKeyName(),
    };
  }
}

const CredentialStore = new AdbNodeJsCredentialStore(
  `${userInfo().username}@${hostname()}`
);
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts
import { AdbCredentialStore, adbGeneratePublicKey } from "@yume-chan/adb";
import { webcrypto } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { homedir, hostname, userInfo } from "node:os";
import { join } from "node:path";

class AdbNodeJsCredentialStore implements AdbCredentialStore {
  #name: string;

  constructor(name: string) {
    this.#name = name;
  }

  #privateKeyPath() {
    return join(homedir(), ".android", "adbkey");
  }

  #publicKeyPath() {
    return join(homedir(), ".android", "adbkey.pub");
  }

  async generateKey() {
    const { privateKey: cryptoKey } = await webcrypto.subtle.generateKey(
      {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 2048,
        // 65537
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: "SHA-1",
      },
      true,
      ["sign", "verify"]
    );

    const privateKey = new Uint8Array(
      await crypto.subtle.exportKey("pkcs8", cryptoKey)
    );
    await writeFile(
      this.#privateKeyPath(),
      Buffer.from(privateKey).toString("utf8")
    );
    await writeFile(
      this.#publicKeyPath(),
      `${Buffer.from(adbGeneratePublicKey(privateKey)).toString("base64")} ${
        this.#name
      }\n`
    );

    return {
      buffer: privateKey,
      name: this.#name,
    };
  }

  async #readPubKeyName() {
    const content = await readFile(this.#publicKeyPath(), "utf8");
    const pubKeyName = content.split(" ")[1];
    return pubKeyName || `${userInfo().username}@${hostname()}`;
  }

  async *iterateKeys() {
    const content = await readFile(this.#privateKeyPath(), "utf8");
    const privateKey = Buffer.from(
      content.split("\n").slice(1, -2).join(""),
      "base64"
    );
    yield {
      buffer: privateKey,
      name: await this.#readPubKeyName(),
    };
  }
}

const CredentialStore = new AdbNodeJsCredentialStore(
  `${userInfo().username}@${hostname()}`
);
```

</TabItem>
</Tabs>

It uses [Web Crypto](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) API to generate private keys, and store it in `~/.android/adbkey` and `~/.android/adbkey.pub`, same as Google ADB.

### Get device manager

<Tabs groupId="code">
<TabItem value="js" label="JavaScript">

```ts
import { AdbDaemonWebUsbDeviceManager } from "@yume-chan/adb-daemon-webusb";
import { WebUSB } from "usb";

const WebUsb = new WebUSB({ allowAllDevices: true });
const Manager = new AdbDaemonWebUsbDeviceManager(WebUsb);
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts
import { AdbDaemonWebUsbDeviceManager } from "@yume-chan/adb-daemon-webusb";
import { WebUSB } from "usb";

const WebUsb: WebUSB = new WebUSB({ allowAllDevices: true });
const Manager: AdbDaemonWebUsbDeviceManager = new AdbDaemonWebUsbDeviceManager(
  WebUsb
);
```

</TabItem>
</Tabs>

`@yume-chan/adb-daemon-webusb` package provides an abstraction over WebUSB API. It can use varies WebUSB compatible implementations.

`usb` package provides a WebUSB compatible implementation for Node.js. Passing the `allowAllDevices: true` option disables the permission system and returns all available devices from `getDevices` methods.

### Get all connected devices

While `WebUsb.getDevices()` returns all available USB devices, `AdbDaemonWebUsbDeviceManager.getDevices()` picks ADB devices only.

<Tabs groupId="code">
<TabItem value="js" label="JavaScript">

```ts
const devices = await Manager.getDevices();

if (!devices.length) {
  alert("No device connected");
  return;
}

const device = devices[0];
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts
import { AdbDaemonWebUsbDevice } from "@yume-chan/adb-daemon-webusb";

const devices: AdbDaemonWebUsbDevice[] = await Manager.getDevices();
if (!devices.length) {
  alert("No device connected");
  return;
}

const device: AdbDaemonWebUsbDevice = devices[0];
```

</TabItem>
</Tabs>

### Open a connection to device

Only one process across the whole operating system can access a USB device at a time. That's why Tango doesn't work with Google ADB in direct connection mode.

Getting a device instance doesn't automatically request the exclusive access. You need to call `connect` to do it.

<Tabs groupId="code">
<TabItem value="js" label="JavaScript">

```ts
const connection = await device.connect();
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts
import { AdbPacketData, AdbPacketInit } from "@yume-chan/adb";
import { Consumable, ReadableWritablePair } from "@yume-chan/stream-extra";

const connection: ReadableWritablePair<
  AdbPacketData,
  Consumable<AdbPacketInit>
> = await device.connect();
```

</TabItem>
</Tabs>

The connection might fail due to various reasons, such as:

1. Another process (e.g. Google ADB, a web browser) already has the exclusive access to the device. Google ADB might be indirectly started by other tools, such as Android Studio, Visual Studio with Mobile development workloads, Godot Editor, Scrcpy...
2. The device is disconnected between `getDevices` and `connect`.

### Authenticate with device

<Tabs groupId="code">
<TabItem value="js" label="JavaScript">

```ts
import { AdbDaemonTransport } from "@yume-chan/adb";

const transport = await AdbDaemonTransport.authenticate({
  serial: device.serial,
  connection,
  credentialStore: CredentialStore,
});
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts
import { AdbDaemonTransport } from "@yume-chan/adb";

const transport: AdbDaemonTransport = await AdbDaemonTransport.authenticate({
  serial: device.serial,
  connection,
  credentialStore: CredentialStore,
});
```

</TabItem>
</Tabs>

This will use the credential store to retrieve or generate a private key, and use it to authenticate with the device.

If the private key is not yet trusted by the device, a dialog will be shown on device screen to let users confirm the connection.

Even if the user checked "Always allow from this computer" in the dialog, the private key may lost trust due to various reasons, such as:

1. On Android 11 or newer, the device will automatically revoke the trust if the private key is not used for 7 days, unless this feature is disabled by the user.
2. On Android 11 or newer, the user can manually revoke the trust for individual private keys in "Settings -> Developer options -> Wireless debugging -> Paired devices".
3. On Android 10 or older, the user can manually revoke all trusts in "Settings -> Developer options -> Revoke USB debugging authorizations".

### Create ADB instance

<Tabs groupId="code">
<TabItem value="js" label="JavaScript">

```ts
import { Adb } from "@yume-chan/adb";

const adb = new Adb(transport);
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts
import { Adb } from "@yume-chan/adb";

const adb = new Adb(transport);
```

</TabItem>
</Tabs>

Transports contains the lower-level logic to communicate with devices. `Adb` class provides a higher-level abstraction over ADB protocol and ADB commands.

## Complete example

<Tabs groupId="code">
<TabItem value="js" label="JavaScript">

```ts
import { Adb, AdbDaemonTransport, adbGeneratePublicKey } from "@yume-chan/adb";
import { AdbDaemonWebUsbDeviceManager } from "@yume-chan/adb-daemon-webusb";
import { webcrypto } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { homedir, hostname, userInfo } from "node:os";
import { join } from "node:path";
import { WebUSB } from "usb";

class AdbNodeJsCredentialStore {
  #name;

  constructor(name) {
    this.#name = name;
  }

  #privateKeyPath() {
    return join(homedir(), ".android", "adbkey");
  }

  #publicKeyPath() {
    return join(homedir(), ".android", "adbkey.pub");
  }

  async generateKey() {
    const { privateKey: cryptoKey } = await webcrypto.subtle.generateKey(
      {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 2048,
        // 65537
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: "SHA-1",
      },
      true,
      ["sign", "verify"]
    );

    const privateKey = new Uint8Array(
      await crypto.subtle.exportKey("pkcs8", cryptoKey)
    );
    await writeFile(
      this.#privateKeyPath(),
      Buffer.from(privateKey).toString("utf8")
    );
    await writeFile(
      this.#publicKeyPath(),
      `${Buffer.from(adbGeneratePublicKey(privateKey)).toString("base64")} ${
        this.#name
      }\n`
    );

    return {
      buffer: privateKey,
      name: this.#name,
    };
  }

  async #readPubKeyName() {
    const content = await readFile(this.#publicKeyPath(), "utf8");
    const pubKeyName = content.split(" ")[1];
    return pubKeyName || `${userInfo().username}@${hostname()}`;
  }

  async *iterateKeys() {
    const content = await readFile(this.#privateKeyPath(), "utf8");
    const privateKey = Buffer.from(
      content.split("\n").slice(1, -2).join(""),
      "base64"
    );
    yield {
      buffer: privateKey,
      name: await this.#readPubKeyName(),
    };
  }
}

const CredentialStore = new AdbNodeJsCredentialStore(
  `${userInfo().username}@${hostname()}`
);

const WebUsb = new WebUSB({ allowAllDevices: true });
const Manager = new AdbDaemonWebUsbDeviceManager(WebUsb);

const devices = await Manager.getDevices();
if (!devices.length) {
  alert("No device connected");
  return;
}

const device = devices[0];

const connection = await device.connect();

const transport = await AdbDaemonTransport.authenticate({
  serial: device.serial,
  connection,
  credentialStore: CredentialStore,
});

const adb = new Adb(transport);
```

</TabItem>
<TabItem value="ts" label="TypeScript">

```ts
import {
  Adb,
  AdbCredentialStore,
  AdbDaemonTransport,
  AdbPacketData,
  AdbPacketInit,
  adbGeneratePublicKey,
} from "@yume-chan/adb";
import {
  AdbDaemonWebUsbDevice,
  AdbDaemonWebUsbDeviceManager,
} from "@yume-chan/adb-daemon-webusb";
import { Consumable, ReadableWritablePair } from "@yume-chan/stream-extra";
import { webcrypto } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { homedir, hostname, userInfo } from "node:os";
import { join } from "node:path";
import { WebUSB } from "usb";

class AdbNodeJsCredentialStore implements AdbCredentialStore {
  #name: string;

  constructor(name: string) {
    this.#name = name;
  }

  #privateKeyPath() {
    return join(homedir(), ".android", "adbkey");
  }

  #publicKeyPath() {
    return join(homedir(), ".android", "adbkey.pub");
  }

  async generateKey() {
    const { privateKey: cryptoKey } = await webcrypto.subtle.generateKey(
      {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 2048,
        // 65537
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: "SHA-1",
      },
      true,
      ["sign", "verify"]
    );

    const privateKey = new Uint8Array(
      await crypto.subtle.exportKey("pkcs8", cryptoKey)
    );
    await writeFile(
      this.#privateKeyPath(),
      Buffer.from(privateKey).toString("utf8")
    );
    await writeFile(
      this.#publicKeyPath(),
      `${Buffer.from(adbGeneratePublicKey(privateKey)).toString("base64")} ${
        this.#name
      }\n`
    );

    return {
      buffer: privateKey,
      name: this.#name,
    };
  }

  async #readPubKeyName() {
    const content = await readFile(this.#publicKeyPath(), "utf8");
    const pubKeyName = content.split(" ")[1];
    return pubKeyName || `${userInfo().username}@${hostname()}`;
  }

  async *iterateKeys() {
    const content = await readFile(this.#privateKeyPath(), "utf8");
    const privateKey = Buffer.from(
      content.split("\n").slice(1, -2).join(""),
      "base64"
    );
    yield {
      buffer: privateKey,
      name: await this.#readPubKeyName(),
    };
  }
}

const CredentialStore = new AdbNodeJsCredentialStore(
  `${userInfo().username}@${hostname()}`
);

const WebUsb: WebUSB = new WebUSB({ allowAllDevices: true });
const Manager: AdbDaemonWebUsbDeviceManager = new AdbDaemonWebUsbDeviceManager(
  WebUsb
);

const devices: AdbDaemonWebUsbDevice[] = await Manager.getDevices();
if (!devices.length) {
  alert("No device connected");
  return;
}

const device: AdbDaemonWebUsbDevice = devices[0];

const connection: ReadableWritablePair<
  AdbPacketData,
  Consumable<AdbPacketInit>
> = await device.connect();

const transport: AdbDaemonTransport = await AdbDaemonTransport.authenticate({
  serial: device.serial,
  connection,
  credentialStore: CredentialStore,
});

const adb = new Adb(transport);
```

</TabItem>
</Tabs>

## Next Step

- [Run commands](../commands/overview)
