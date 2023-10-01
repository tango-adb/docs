---
sidebar_position: 1
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# Create credential store

Directly connecting to devices requires authentication. ADB uses [RSA algorithm](<https://en.wikipedia.org/wiki/RSA_(cryptosystem)>) to identify clients. Tango can use varies credential stores to support different runtimes.

<Tabs className="runtime-tabs" groupId="runtime">
<TabItem value="web" label="Web">

`@yume-chan/adb-credential-web` package uses [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) to generate ADB private keys, and uses [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) to store them.

```ts transpile
import AdbWebCredentialStore from "@yume-chan/adb-credential-web";

const CredentialStore: AdbWebCredentialStore = new AdbWebCredentialStore();
```

Optionally, you can provide a name for your keys. On devices with Android 11 or newer, it will appear in "Settings -> Developer options -> Wireless debugging -> Paired devices". The default value is `Tango@<current host name>`, e.g. `Tango@app.tangoapp.dev`.

```ts transpile
import AdbWebCredentialStore from "@yume-chan/adb-credential-web";

const CredentialStore: AdbWebCredentialStore = new AdbWebCredentialStore(
  "Your Key Name",
);
```

</TabItem>
<TabItem value="node" label="Node.js">

There is currently no NPM package for a Node.js compatible credential store, but here is a reference implementation:

It uses [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) to generate private keys, and stores them in `~/.android/adbkey` and `~/.android/adbkey.pub` files, same as Google ADB.

```ts transpile
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
```

</TabItem>
<TabItem value="custom" label="Custom">

Tango expects each private key to have two fields:

- `buffer`: A [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) (or Node.js [`Buffer`](https://nodejs.org/api/buffer.html)) containing the private key in [PKCS#8](https://en.wikipedia.org/wiki/PKCS_8) format.
- `name`: A `string`, the name of the key. On devices with Android 11 or newer, it will appear in "Settings -> Developer options -> Wireless debugging -> Paired devices". The default value is `nouser@nohostname`.

To create a custom credential store implementation, you need to provide two methods:

- `generateKey`: Generate a new RSA private key with a modulus length of 2048 bits, a public exponent of 65537, and use SHA-1 as the hash algorithm. It can either synchronously or asynchronously return a private key in the above format. It should store the generated key somewhere so that it can be retrieved later.
- `iterateKeys`: Iterate through all stored private keys. It can return either a synchronous or an asynchronous iterator. Each item in the iterator must be a private key in the above format. The iterator can have either zero, one, or multiple items.

:::info

You can choose to not saving the private key and generate a new one every time. However, this will cause the device to display a dialog asking the user to confirm the connection every time.

:::

:::danger

You must not use a fixed private key for all users. Everyone can see the private key and use it to connect to your users' devices.

:::

ADB protocol uses two authentication methods:

1. Signature: The device generates a challenge and sends it to the client. The client signs the challenge with the private key and sends the signature back to the device. The device verifies the signature with all trusted public keys.
2. Public key: The client sends its public key to the device. The device displays a dialog asking the user to confirm the connection. If the user confirms, the connection will be established.

The authentication process is as follows:

1. Tango calls `iterateKeys`
   1. For each key, Tango uses it in signature authentication. If the authentication succeeds, no further steps will be taken.
2. Tango calls `iterateKeys` again
   1. If it returns at least one key, Tango uses the first key in public key authentication. No matter the authentication succeeds or not, no further steps will be taken.
3. `generateKey` is called, and the generated key is used in public key authentication.

See the Node.js tab for an example.

</TabItem>
</Tabs>

<Tabs className="runtime-tabs" groupId="direct-connection">
<TabItem value="usb" label="USB">

:::note Next Step

[Create USB connection](./usb/device-manager.md)

:::

</TabItem>
<TabItem value="tcp" label="TCP">

:::note Next Step

[Create TCP connection](./tcp/enable.md)

:::

</TabItem>
<TabItem value="custom" label="Custom">

:::note Next Step

[Create custom connection](./custom-connection.md)

:::

</TabItem>
</Tabs>
