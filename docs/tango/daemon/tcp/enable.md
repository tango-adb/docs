---
sidebar_position: 1
---

# Enable ADB over WiFi

ADB over WiFi allows you to connect to your device wirelessly. This is useful when you want to connect to your device without using a USB cable, or if you want to connect multiple devices to the same computer.

## Android 11 and above

Android 11 adds a new Wireless Debugging feature in Developer Options, which allows you to enable ADB over WiFi without using a USB cable.

However, Wireless Debugging is different from ADB over WiFi, and has the following limitations:

* It chooses a random port to listen at, and the port number changes every time the device is restarted.
* Client certificate can only be trusted using the new ADB pairing feature, which is not supported by Tango.

## Rooted devices

On rooted devices, ADB over WiFi can be enabled by running the following command on the device:

```sh
su
setprop service.adb.tcp.port 5555
stop adbd
start adbd
```

`5555` is the port ADB daemon will listen at, and can be freely changed.

## Other devices

On non-rooted devices with Android 10 and below, enabling ADB over WiFi requires first connecting the device using a USB cable.

- To enable ADB over WiFi using Google ADB, run the following command in a terminal:

  ```sh
  adb tcpip 5555
  ```

  `5555` is the port ADB daemon will listen at, and can be freely changed.

- To enable ADB over WiFI using Tango, use the [`tcpip` command](../../commands/tcpip.md).

When device is restarted, ADB over WiFi will be disabled. To re-enable it, connect the device using a USB cable and follow the steps above again.
