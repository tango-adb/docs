---
sidebar_position: 2
---

# tcpip

Enable/disable ADB over WiFi.

:::note

Toggling ADB over WiFi will restart ADB daemon, causing all existing connections to be closed.

:::

```ts
declare class AdbTcpIpCommand extends AdbCommandBase {
  setPort(port: number): Promise<string>;
  disable(): Promise<string>;
}

declare class Adb {
  readonly tcpip: AdbTcpIpCommand;
}
```

## Enable ADB over WiFi

```ts transpile
await adb.tcpip.setPort(5555);
```

## Disable ADB over WiFi

```ts transpile
await adb.tcpip.disable();
```
