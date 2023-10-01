---
sidebar_position: 1
slug: ./
---

# Overview

Exposed as fields of `Adb` class, these are implemented by ADB daemon itself.

* `subprocess`: Spawn processes on device and read/write their stdin/stdout/stderr
* `power`: Shutdown/reboot device
* `reverse`: Manage reverse port forwarding
* [`tcpip`](./tcpip.md): Enable/disable ADB over WiFi
* [`getProp`](./get-prop.md): Shorthand for `getprop` executable
* [`rm`](./rm.md): Delete files on device
* [`sync`](./sync/overview.md): Interact with device filesystem
* [`framebuffer`](./framebuffer.md): Capture device screen
