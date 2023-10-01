---
sidebar_position: 4
---

# Create custom connection

:::note

Daemon connection is still dealing with exclusive device access. If you want to create a mux protocol, create a custom transport instead.

:::

We have seen `AdbDaemonWebUsbDevice` class in USB connection and `AdbDaemonDirectSocketsDevice` class in TCP connection, but they are high-level abstractions for managing devices. In fact, `AdbDaemonTransport` only needs a pair of `ReadableStream` and `WriteableStream` to work, that's what the `connect` method in those `Device` classes returns.

:::note

See [Web Streams Basics](/docs/adb/web-stream.md) for a quick introduction to Web Streams API.

:::

## AdbPacket

`AdbDaemonTransport` uses `AdbPacket` objects, so each connection can represent and transfer those packets in different ways. USB and TCP connections convert them to raw bytes, but custom connections can also transfer them using JSON, protobuf, or any other formats over the Internet.

For the `ReadableStream` side, each packet object must have the following fields:

- command: A number that represents the command.
- arg0: A number that represents the first argument.
- arg1: A number that represents the second argument.
- payload: A `Uint8Array` that represents the payload.

For the `WriteableStream` side, each packet object will have two extra fields:

- checksum: A number that represents the checksum of the packet.
- magic: A number that represents the magic of the packet.

See [Create TCP connection](./tcp/create-connection.md#adbdaemondirectsocketsdevice) for an example.
