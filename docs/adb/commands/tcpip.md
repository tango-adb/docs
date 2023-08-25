---
sidebar_position: 2
---

Enable/disable ADB over WiFi.

Toggling ADB over WiFi will restart ADB daemon, causing all existing connections to be closed.

```ts
class AdbTcpIpCommand extends AdbCommandBase {
  setPort(port: number): Promise<string>;
  disable(): Promise<string>;
}
```

## Enable ADB over WiFi

```ts
await adb.tcpip.setPort(5555);
```

## Disable ADB over WiFi

```ts
await adb.tcpip.disable();
```
