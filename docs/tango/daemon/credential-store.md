---
sidebar_position: 4
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# Create credential store

Directly connecting to devices requires authentication. The authentication process uses [RSA algorithm](<https://en.wikipedia.org/wiki/RSA_(cryptosystem)>), except it uses a custom public key format.

ADB protocol has two authentication methods:

1. Public key: The client sends its public key to the device. The device displays a dialog asking its user to confirm the connection. If the user confirms, the connection will be established. If the user also checks "Always allow from this computer", the device will trust the public key.
2. Signature: The device generates a challenge and sends it to the client. The client signs the challenge with its private key and sends the signature back to the device. The device verifies if the signature is produced by one of its trusted public keys.

:::info

Even if the user checked "Always allow from this computer", the public key may lost trust due to various reasons, such as:

1. On Android 11 and above, the device will automatically revoke the trust if the key is not used in last 7 days. This feature can be disabled by users in the developer settings.
2. On Android 11 and above, the user can manually untrust individual keys in "Settings -> Developer options -> Wireless debugging -> Paired devices".
3. On Android 10 and below, the user can manually untrust all keys in "Settings -> Developer options -> Revoke USB debugging authorizations".

:::

Tango supports both authentication methods, and can use varies credential stores to support different runtimes.

<Tabs className="runtime-tabs" groupId="runtime">
<TabItem value="web" label="Web">

[`@yume-chan/adb-credential-web`](https://www.npmjs.com/package/@yume-chan/adb-credential-web) package uses [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) to generate ADB private keys, and uses [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) to store them.

```sh npm2yarn
npm i @yume-chan/adb-credential-web
```

```ts transpile
import AdbWebCredentialStore from "@yume-chan/adb-credential-web";

const CredentialStore: AdbWebCredentialStore = new AdbWebCredentialStore();
```

Optionally, you can provide a name for your keys. On Android 11 and above, it will appear in "Settings -> Developer options -> Wireless debugging -> Paired devices". The default value is `Tango@<current host name>`, e.g. `Tango@app.tangoapp.dev`.

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

In Tango, each private key is a plain object with the following fields:

- `buffer`: A [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) (or Node.js [`Buffer`](https://nodejs.org/api/buffer.html)) containing the private key in [PKCS#8](https://en.wikipedia.org/wiki/PKCS_8) format.
- `name`: A `string`, the name of the key. On Android 11 and above, it will appear in "Settings -> Developer options -> Wireless debugging -> Paired devices". The default value is `nouser@nohostname`.

To create a custom credential store implementation, you need to provide two methods:

- `generateKey`: Generate a new RSA private key with a modulus length of 2048 bits, a public exponent of 65537, and use SHA-1 as the hash algorithm. It can either synchronously or asynchronously return a private key in the above format. It should store the generated key somewhere so that it can be retrieved later.
- `iterateKeys`: Iterate through all stored private keys. It can return either a synchronous or an asynchronous iterator. Each item in the iterator must be a private key in the above format. The iterator can have either zero, one, or multiple items.

:::info

You can choose to not saving the private key and generate a new one every time. However, this will cause the device to display a dialog asking the user to confirm the connection every time.

:::

:::danger

You must not use a fixed private key for all users. Everyone can see the private key and use it to connect to your users' devices.

:::

The authentication process is as follows:

1. Tango calls `iterateKeys`
   1. For each key, Tango uses it in signature authentication. If the authentication succeeds, no further steps will be taken.
2. Tango calls `iterateKeys` again
   1. If it returns at least one key, Tango uses the first key in public key authentication. No matter the authentication succeeds or not, no further steps will be taken.
3. `generateKey` is called, and the generated key is used in public key authentication.

See the Node.js tab for an example.

</TabItem>
</Tabs>
