---
sidebar_position: 2
---

# Create a new backend

A backend needs to implement the `AdbBackend` interface.

```ts
interface AdbBackend {
    readonly serial: string;

    readonly name: string | undefined;

    connect(): ValueOrPromise<
        ReadableWritablePair<AdbPacketData, AdbPacketInit>
    >;
}
```

Tango uses Web Stream API to transfer and transform data between modules. The `connect` method returns a `ReadableWritablePair` object, which contains a `ReadableStream` in `readable` field and a `WritableStream` in `writable` field.
