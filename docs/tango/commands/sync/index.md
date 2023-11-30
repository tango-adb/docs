---
sidebar_position: 1
slug: ./
---

# Overview

Sync command is used to interact with device filesystem.

Sync connection has its own data protocol, so `Adb#sync` creates a connection that you can run commands on.

## Create a sync connection

```ts transpile
const sync: AdbSync = await adb.sync();
```

## Concurrency

1. Each sync connection can only run one command at a time.
2. Calling another command while a command is still running will wait for the previous command to finish.
3. Multiple sync connections to the same device can be created to run multiple commands at the same time.

:::danger[READ ALL STREAMS!]

ADB is a multiplexing protocol (multiple logic streams are transferred over one connection), so blocking one stream will block all other streams.

You must continuously read from all sync connections to prevent this from happening.

:::

## Close sync connection

You should close the sync connection when you no longer need it. This closes the underlying socket.

```ts transpile
await sync.dispose();
```

:::info

Not closing sync connections will cause a small memory leak.

:::

## Supported methods

- [`lstat`/`stat`](./stat.md): Get file information
- [`isDirectory`](./isDirectory.md): Check if a path is a directory
- [`opendir`/`readdir`](./opendir.md): List files in a directory
- [`read`](./read.md): Read file content
- [`write`](./write.md): Write file content
