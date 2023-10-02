---
sidebar_position: 2
---

# subprocess

Spawn processes on device.

## Raw mode vs PTY mode

Normally, when a process is started from terminal, it can interact with the terminal, it can:

- Know the window size
- Move the cursor
- Clear the screen
- Change the text color
- etc.

For example, `ls` can print colored output when it's started from terminal, `less` can print exactly one screen of output and wait for user input, etc.

But if the process is started programmatically by another process, it's not attached to a terminal, and thus it cannot do any of the above. `ls` will print plain text, `less` will print all of its output and exit immediately.

The parent process (spawner) can do either of the following:

- Spawn the child process in raw mode. The parent process can write to the child process's stdin, and read from its stdout and stderr. But the child process still don't have a terminal to interact with.
- Use a [pseudo-terminal (PTY)](https://man7.org/linux/man-pages/man7/pty.7.html) to spawn the child process. Pseudo-terminal API makes the child process believe that it's attached to a terminal, but actually all terminal interactions are handled by the parent process.

PTY mode support was added in Android 7.

### How to choose?

- To start a process and parse its output, use raw mode.
- To build a terminal emulator, use PTY mode.

## None protocol vs Shell protocol

ADB can transfer subprocess input/output in two protocols:

|          |                  | None protocol                                 | Shell protocol                                            |
| -------- | ---------------- | --------------------------------------------- | --------------------------------------------------------- |
| raw mode | Write to socket  | Forwards to subprocess's stdin.               | One packet type: stdin                                    |
|          | Read from socket | Subprocess's stdout and stderr mixed together | Three packet types: stdout, stderr, exit code             |
| PTY mode | Write to socket  | Forwards to PTY                               | Three packet types: write to PTY, resize PTY, close stdin |
|          | Read from socket | PTY output                                    | Two packet types: PTY output, exit code                   |

Shell protocol was added in Android 7.

### How to choose?

- To start a process and parse its output, use Shell protocol if separated stdout and stderr, or exit code is needed.
- To build a terminal emulator, use Shell protocol for more features.
- Otherwise, None protocol is more efficient.

## Common types

```ts
export interface AdbSubprocessProtocol {
  readonly stdin: WritableStream<Consumable<Uint8Array>>;
  readonly stdout: ReadableStream<Uint8Array>;
  readonly stderr: ReadableStream<Uint8Array>;
  readonly exit: Promise<number>;
  resize(rows: number, cols: number): ValueOrPromise<void>;
  kill(): ValueOrPromise<void>;
}

interface AdbSubprocessProtocolConstructor {
  isSupported(adb: Adb): ValueOrPromise<boolean>;
  pty(adb: Adb, command: string): ValueOrPromise<AdbSubprocessProtocol>;
  raw(adb: Adb, command: string): ValueOrPromise<AdbSubprocessProtocol>;
  new (socket: AdbSocket): AdbSubprocessProtocol;
}

export interface AdbSubprocessOptions {
  protocols: AdbSubprocessProtocolConstructor[];
}
```

The behavior of `AdbSubprocessProtocol` is described in the following table:

|          |        | None protocol                     | Shell protocol                            |
| -------- | ------ | --------------------------------- | ----------------------------------------- |
| raw mode | stdin  | writes to stdin                   | writes to stdin                           |
|          | stdout | read from stdout and stderr       | read from stdout                          |
|          | stderr | empty                             | read from stderr                          |
|          | exit   | resolve with 0 when process exits | resolve with exit code when process exits |
|          | resize | does nothing                      | resize PTY                                |
|          | kill   | kill process                      | kill process                              |
| PTY mode | stdin  | writes to PTY                     | writes to PTY                             |
|          | stdout | read from PTY                     | read from PTY                             |
|          | stderr | empty                             | empty                                     |
|          | exit   | resolve with 0 when process exits | resolve with exit code when process exits |
|          | resize | does nothing                      | resize PTY                                |
|          | kill   | kill process                      | kill process                              |

`stdout` and `stderr` will close when the process exits.

:::danger READ ALL STREAMS!

ADB is a multiplexing protocol (multiple logic streams are transferred over one connection), so blocking one stream will block all other streams.

You must continuously read from all connections (even if you are not interested in them) to prevent this from happening.

:::

## Start process in raw mode

```ts
declare class AdbSubprocess {
  spawn(
    command: string | string[],
    options?: Partial<AdbSubprocessOptions>,
  ): Promise<AdbSubprocessProtocol>;
}
```

Example:

```ts transpile
import { DecodeUtf8Stream } from "@yume-chan/stream-extra";

const process = await adb.subprocess.spawn("ls -l");
await process.stdout.pipeThrough(new DecodeUtf8Stream()).pipeTo(
  new WritableStream<string>({
    write(chunk) {
      console.log(chunk);
    },
  }),
);
```

:::info Equivalent ADB command

```sh
adb exec-out ls -l
```

:::

This method will use Shell protocol if it's available, otherwise it will use None protocol.

To specify the protocol, use `options.protocols`:

```ts transpile
import { AdbSubprocessShellProtocol } from "@yume-chan/adb";

const process = await adb.subprocess.spawn("ls -l", {
  protocols: [AdbSubprocessShellProtocol],
});
```

This will throw an error if Shell protocol is not supported by the device.

Similarly, to use only None protocol:

```ts transpile
import { AdbSubprocessNoneProtocol } from "@yume-chan/adb";

const process = await adb.subprocess.spawn("ls -l", {
  protocols: [AdbSubprocessNoneProtocol],
});
```

## Start process in PTY mode

```ts
declare class AdbSubprocess {
  shell(
    command?: string | string[],
    options?: Partial<AdbSubprocessOptions>,
  ): Promise<AdbSubprocessProtocol>;
}
```

When `command` is `undefined`, the default shell will be spawned.

The `options` parameter works the same as in `spawn`.

The `stdout` returned from this method will contain terminal escape sequences, which can be parsed using libraries like [xterm.js](https://xtermjs.org/).

Example:

```ts transpile
import { Terminal } from "xterm";
import { encodeUtf8 } from "@yume-chan/adb";
import { Consumable } from "@yume-chan/stream-extra";

const terminal: Terminal = new Terminal();

const process: AdbSubprocessProtocol = await adb.subprocess.shell();
process.stdout.pipeTo(
  new WritableStream<Uint8Array>({
    write(chunk) {
      terminal.write(chunk);
    },
  }),
);

const writer = process.stdin.getWriter();
terminal.onData((data) => {
  const buffer = encodeUtf8(data);
  const consumable = new Consumable(buffer);
  writer.write(consumable);
});

terminal.open(document.getElementById("terminal"));
```
