---
sidebar_position: 1
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# Create a credential store

Directly connecting to devices requires authentication. ADB uses RSA algorithm to identify clients. Tango can use varies credential stores to support different runtimes.

<Tabs className="runtime-tabs" groupId="runtime">
<TabItem value="web" label="Web">

`@yume-chan/adb-credential-web` package uses [Web Crypto](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) API to generate ADB private keys, and uses [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) API to store them.

```ts transpile
import AdbWebCredentialStore from "@yume-chan/adb-credential-web";

const CredentialStore: AdbWebCredentialStore = new AdbWebCredentialStore();
```

Optionally, you can provide a name for your keys. On devices with Android 11 or newer, it will appear in "Settings -> Developer options -> Wireless debugging -> Paired devices".

```ts transpile
import AdbWebCredentialStore from "@yume-chan/adb-credential-web";

const CredentialStore: AdbWebCredentialStore = new AdbWebCredentialStore(
  "Your Key Name",
);
```

</TabItem>
<TabItem value="node" label="Node.js">

There is currently no NPM package for a Node.js compatible credential store, but here is a reference implementation:

It uses [Web Crypto](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) API to generate private keys, and stores them in `~/.android/adbkey` and `~/.android/adbkey.pub`, same as Google ADB.

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
</Tabs>
