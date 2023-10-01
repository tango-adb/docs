---
sidebar_position: 4
---

# Web Streams Basics

[`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) and [`WriteableStream`](https://developer.mozilla.org/en-US/docs/Web/API/WritableStream) are from [Web Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API). They represent a stream of data that can be read from or written to asynchronously.

## `ReadableStream`

To create a `ReadableStream`, you only need to provide a data source:

```ts transpile
const stream: ReadableStream<number> = new ReadableStream<number>({
  start(controller) {
    controller.enqueue(1);
    controller.enqueue(2);
    controller.enqueue(3);
    controller.close();
  },
});
```

The `close` method closes the stream, which means no more data can be added to the stream.

The `enqueue` method adds a value to the stream, it can be called anytime, anywhere, as long as you have a reference to the `controller` object. For example you can do this:

```ts transpile
let controller: ReadableStreamDefaultController<number>;
const stream: ReadableStream<number> = new ReadableStream<number>({
  start(_controller) {
    controller = _controller;
  },
});

setTimeout(() => {
  controller.enqueue(1);
  controller.enqueue(2);
  controller.enqueue(3);
  controller.close();
}, 1000);
```

However this is not very good, because if you produces data too fast, and the consumer can't keep up, the buffered data will take more and more memory. To know when should you enqueue data, you can use the `pull` method:

```ts transpile
let value = 0;
const stream: ReadableStream<number> = new ReadableStream<number>({
  start(controller) {},
  pull(controller) {
    controller.enqueue(value);
    value += 1;
    if (value > 3) {
      controller.close();
    }
  },
});
```

In practice, usually you are converting some other data source to streams. How can you limit the data produce speed depends on the data source.

## `WriteableStream`

`WriteableStream` is the opposite of `ReadableStream`, it represents a stream of data that can be written to. To create a `WriteableStream`, you only need to provide a data sink:

```ts transpile
const stream: WriteableStream<number> = new WriteableStream<number>({
  write(chunk) {
    console.log(chunk);
  },
  close() {
    console.log("closed");
  },
});
```

The `write` callback can be asynchronous, and return when the data is consumed.

The `close` callback is called when the stream is closed.

## Pipe

`ReadableStream`s can be piped to `WriteableStream`s:

```ts transpile
const readable = new ReadableStream<number>({
  start(controller) {
    controller.enqueue(1);
    controller.enqueue(2);
    controller.enqueue(3);
    controller.close();
  },
});

const writeable = new WriteableStream<number>({
  write(chunk) {
    console.log(chunk);
  },
  close() {
    console.log("closed");
  },
});

await readable.pipeTo(writeable);
```

The output is:

```
1
2
3
closed
```

This is usually how you consume a `ReadableStream`.

:::note

Browser's native `ReadableStream` can only `pipeTo` the native `WriteableStream`, this is for performance reasons.

:::

## `TransformStream`

A `TransformStream` has a `WritableStream` `writable` and a `ReadableStream` `readable`. When data is written to `writable`, the transform callback is called, and the transformed data is written to `readable`.

```ts transpile
const transform = new TransformStream<number, string>({
  transform(chunk, controller) {
    controller.enqueue(chunk.toString());
  },
});

const readable = new ReadableStream<number>({
  start(controller) {
    controller.enqueue(1);
    controller.enqueue(2);
    controller.enqueue(3);
    controller.close();
  },
});

const writeable = new WriteableStream<string>({
  write(chunk) {
    console.log(chunk);
  },
  close() {
    console.log("closed");
  },
});

await Promise.all([
  readable.pipeTo(transform.writable),
  transform.readable.pipeTo(writeable),
]);
```

The output is:

```
"1"
"2"
"3"
closed
```

The `transform` callback can be asynchronous, and enqueue zero, one or more data to the `controller`.

To simplify the two `pipeTo` calls, `ReadableStream` also has a `pipeThrough` method:

```ts transpile
await readable.pipeThrough(transform).pipeTo(writeable);
```

In fact, `pipeThrough` method works for any object that has a `WritableStream` `writable` and a `ReadableStream` `readable` field, it returns the `readable` field.

## Extra streams

### `PushReadableStream`

`@yume-chan/stream-extra` package provides a `PushReadableStream` class, which can simplify the process of converting push style data sources to streams. The `enqueue` method of `PushReadableStreamController` returns a `Promise` that resolves when the data is consumed.

```ts transpile
import { PushReadableStream } from "@yume-chan/stream-extra";

const stream = new PushReadableStream<number>(async (controller) => {
  await controller.enqueue(1);
  await controller.enqueue(2);
  await controller.enqueue(3);
  controller.close();
});
```

### Consumable streams

When data is piped through multiple `TransformStream`s, the initial `ReadableStream` won't wait for the data to reach the final `WritableStream`. The `pull` callback will be called as soon as the data is consumed by the first `TransformStream`.

`@yume-chan/stream-extra` package provides a `Consumable<T>` wrapper class, so your producer can know when the data is truly consumed.

```ts transpile
import { Consumable } from "@yume-chan/stream-extra";

const stream = new ReadableStream<Consumable<number>>({
  async pull(controller) {
    const consumable = new Consumable<number>(1);
    controller.enqueue(consumable);
    await consumable.consumed;
  },
});
```

A consumable transform stream can chain the consumed events between the input and output chunks.

This is useful when you want to reuse the same data object to reduce memory allocation.
