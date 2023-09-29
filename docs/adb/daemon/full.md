---
sidebar_position: 7
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# Full example

<Tabs className="runtime-tabs" groupId="runtime">
<TabItem value="web" label="Web">

```ts transpile
import {
  Adb,
  AdbDaemonTransport,
  AdbPacketData,
  AdbPacketInit,
} from "@yume-chan/adb";
import AdbWebCredentialStore from "@yume-chan/adb-credential-web";
import {
  AdbDaemonWebUsbDevice,
  AdbDaemonWebUsbDeviceManager,
} from "@yume-chan/adb-daemon-webusb";
import { Consumable, ReadableWritablePair } from "@yume-chan/stream-extra";

const CredentialStore: AdbWebCredentialStore = new AdbWebCredentialStore(
  "Your Key Name",
);

const Manager: AdbDaemonWebUsbDeviceManager | undefined =
  AdbDaemonWebUsbDeviceManager.BROWSER;

if (!Manager) {
  alert("WebUSB is not supported in this browser");
  return;
}

async function connect(device: AdbDaemonWebUsbDevice) {
  const connection: ReadableWritablePair<
    AdbPacketData,
    Consumable<AdbPacketInit>
  > = await device.connect();

  const transport: AdbDaemonTransport = await AdbDaemonTransport.authenticate({
    serial: device.serial,
    connection,
    credentialStore: CredentialStore,
  });

  const adb: Adb = new Adb(transport);
}

document.getElementById("button").addEventListener("click", () => {
  const device: AdbDaemonWebUsbDevice | undefined =
    await Manager.requestDevice();

  if (!device) {
    alert("No device selected");
    return;
  }

  connect(device);
});

const devices: AdbDaemonWebUsbDevice[] = await Manager.getDevices();
if (!devices.length) {
  alert("No device connected");
  return;
}

for (const device of devices) {
  connect(devices);
}
```

</TabItem>
<TabItem value="node" label="Node.js">

```ts transpile
import {
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
      ["sign", "verify"],
    );

    const privateKey = new Uint8Array(
      await crypto.subtle.exportKey("pkcs8", cryptoKey),
    );
    await writeFile(
      this.#privateKeyPath(),
      Buffer.from(privateKey).toString("utf8"),
    );
    await writeFile(
      this.#publicKeyPath(),
      `${Buffer.from(adbGeneratePublicKey(privateKey)).toString("base64")} ${
        this.#name
      }\n`,
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
      "base64",
    );
    yield {
      buffer: privateKey,
      name: await this.#readPubKeyName(),
    };
  }
}

const CredentialStore = new AdbNodeJsCredentialStore(
  `${userInfo().username}@${hostname()}`,
);

const WebUsb: WebUSB = new WebUSB({ allowAllDevices: true });
const Manager: AdbDaemonWebUsbDeviceManager = new AdbDaemonWebUsbDeviceManager(
  WebUsb,
);

async function connect(device: AdbDaemonWebUsbDevice) {
  const connection: ReadableWritablePair<
    AdbPacketData,
    Consumable<AdbPacketInit>
  > = await device.connect();

  const transport: AdbDaemonTransport = await AdbDaemonTransport.authenticate({
    serial: device.serial,
    connection,
    credentialStore: CredentialStore,
  });

  const adb: Adb = new Adb(transport);
}

const devices: AdbDaemonWebUsbDevice[] = await Manager.getDevices();
if (!devices.length) {
  alert("No device connected");
  return;
}

for (const device of devices) {
  connect(devices);
}
```

</TabItem>
</Tabs>
