---
sidebar_position: 6
---

# Forward tunnel

Forward tunnel allows you to connect to a socket address on the device from Tango.

Unlike in Google ADB CLI, forward tunnel in Tango doesn't require registering the tunnel using a local address, and can be created directly.

```ts
declare class Adb {
  createSocket(address: string): Promise<AdbSocket>;
}
```

## Example

```ts transpile
const socket = await adb.createSocket("tcp:1234");
```

:::info Equivalent ADB command

It doesn't work in the same way, but you can use the following command to register a forward tunnel and connect to it:

```sh
adb forward tcp:1234 tcp:1234
nc localhost 1234
```

:::
