---
sidebar_position: 1
slug: ./
---

# Overview

Sync command is used to interact with device filesystem.

## Create a sync connection

```ts transpile
const sync: AdbSync = await adb.sync();
```

## Concurrency

1. Each sync connection can only run one command at a time.
2. Calling another command while a command is still running will wait for the previous command to finish.
3. You can create multiple sync connections to the same device to run multiple commands at the same time.

## Close sync connection

You should close the sync connection when you no longer need it. This closes the underlying socket. Although failed to do so won't cause any big problem.

```ts transpile
await sync.dispose();
```

## Supported methods

- `lstat`/`stat`: Get file information
- `isDirectory`: Check if a path is a directory
- `opendir`/`readdir`: List files in a directory
- [`read`](./read.md): Read file content
- `write`: Write file content
