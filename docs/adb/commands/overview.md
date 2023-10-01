---
sidebar_position: 1
slug: ./
---

# Overview

# Core commands

Exposed as fields of `Adb` class, these are implemented by ADB daemon itself.

* `subprocess`: Spawn processes on device and read/write their stdin/stdout/stderr
* `power`: Shutdown/reboot device
* `reverse`: Manage reverse port forwarding
* [`tcpip`](./tcpip.md): Enable/disable ADB over WiFi
* [`getProp`](./get-prop.md): Shorthand for `getprop` executable
* [`rm`](./rm.md): Delete files on device
* [`sync`](./sync/overview.md): Interact with device filesystem
* `framebuffer`: Capture device screen

## Binary Wrappers

Exposed as individual classes from `@yume-chan/android-bin` package, these are abstractions over Android executables.

* `bu`: Backup/restore apps and data
* `bugreport`: Dump device information
* `cmd`: Interact with Android system services
* `Demo mode`: Control demo mode
* `dumpsys`: Dump system service information
* `logcat`: View device logs
* `Overlay Display`: Manages simulated secondary displays
* `pm`: Manage apps
* `settings`: Get/set Android system settings
