---
sidebar_position: 3
---

# Connect to device

Each backend might has different ways to discover devices. After obtaining a backend instance, call the `connect` method to create a connection.

```ts
connect(): ValueOrPromise<ReadableWritablePair<AdbPacketCore, AdbPacketInit>>
```

## Authentication

Pass the returned connection to `Adb.authenticate` static method to authenticate the connection.

```ts
public static async authenticate(
    connection: ReadableWritablePair<AdbPacketData, AdbPacketInit>,
    credentialStore: AdbCredentialStore,
    authenticators = ADB_DEFAULT_AUTHENTICATORS
): Promise<Adb>
```
