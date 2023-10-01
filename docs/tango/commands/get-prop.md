---
sidebar_position: 3
---

# getProp

Shorthand for `getprop` executable.

```ts
declare class Adb {
    getProp(key: string): Promise<string>;
}
```

It will trim the last newline character from the output.

## Examples

### Get Android OS version

```ts transpile
const version = await adb.getProp("ro.build.version.release");
```

### Get ADB over WiFi listen port

```ts transpile
const port = await this.adb.getProp("service.adb.tcp.port");
```
