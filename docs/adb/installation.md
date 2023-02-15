---
sidebar_position: 1
---

# Installation

<!--
cspell: ignore struct
cspell: ignore webusb
-->

`@yume-chan/adb` package is the core of Tango. it only implements the ADB protocol, so can be used in a variety of environments.

## Requirement

| Dependency                      | Chrome | Edge | Firefox | Internet Explorer | Safari | Node.js             |
| ------------------------------- | ------ | ---- | ------- | ----------------- | ------ | ------------------- |
| `@yume-chan/struct`<sup>1</sup> | 67     | 79   | 68      | No                | 14     | 8.3<sup>2</sup>, 11 |
| *Overall*                       | 67     | 79   | No      | No                | 14.1   | 16.5                |

&#8203; <sup>1</sup> `uint64` and `string` are used.

&#8203; <sup>2</sup> `TextEncoder` and `TextDecoder` are only available in `util` module. Need to be assigned to `globalThis`.

## Installation

```bash
npm install @yume-chan/adb
```

```bash
yarn add @yume-chan/adb
```

```bash
pnpm install @yume-chan/adb
```

## Choose a backend

A Backend transfers data between `@yume-chan/adb` and device. The implementation depends on environment and connection type.

Here are some available backends:

### `@yume-chan/adb-backend-webusb`

Using WebUSB API to connect to devices over USB. Requires a compatible browser or Node.js with `usb` package.

### `@yume-chan/adb-backend-ws` (WIP)

Using WebSocket API to connect to devices over TCP. Requires a WebSockify proxy to bridge the WebSocket connection to TCP.

### `@yume-chan/adb-backend-direct-socket` (WIP)

Using Direct Socket API to connect to devices over TCP. Requires a compatible browser.

### More backend possibilities

* Using Node.js `net` module to connect to devices over TCP.
* Using Direct Socket/Node.js `net` module to connect to local ADB server.

## Choose a credential store

Credential store generate and store RSA keys for authentication.

Currently, only `@yume-chan/adb-credential-web` is available, which uses Web Crypto API to generate and Web Storage API to store keys.
