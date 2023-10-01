---
sidebar_position: 6
---

# framebuffer

Framebuffer command takes a pixel-by-pixel screenshot of the device screen.

```ts
interface AdbFrameBuffer {
  bpp: number;
  colorSpace?: number;
  size: number;
  width: number;
  height: number;
  red_offset: number;
  red_length: number;
  blue_offset: number;
  blue_length: number;
  green_offset: number;
  green_length: number;
  alpha_offset: number;
  alpha_length: number;
  data: Uint8Array;
}

declare class Adb {
  framebuffer(): Promise<AdbFrameBuffer>;
}
```

The four `color_offset` and `color_length` fields are numbers in bits. For example, RGBA8888 color format is represented by:

| field          | value |
| -------------- | ----- |
| `red_offset`   | 0     |
| `red_length`   | 8     |
| `blue_offset`  | 16    |
| `blue_length`  | 8     |
| `green_offset` | 8     |
| `green_length` | 8     |
| `alpha_offset` | 24    |
| `alpha_length` | 8     |

## Errors

```ts
declare abstract class AdbFrameBufferError extends Error {}

declare class AdbFrameBufferUnsupportedVersionError extends AdbFrameBufferError {}

declare class AdbFrameBufferForbiddenError extends AdbFrameBufferError {}
```

Framebuffer command has multiple versions, currently Tango supports version 1 and 2. If the device returns an unsupported version, an `AdbFrameBufferUnsupportedVersionError` will be thrown.

Apps can disable screenshot by setting `FLAG_SECURE` flag on their windows. If the device is in this state, an `AdbFrameBufferForbiddenError` will be thrown.

## Examples

### Take a screenshot

```ts transpile
const screenshot = await adb.framebuffer();
```

### Draw the screenshot to a canvas

Assume the screenshot has RGBA8888 color format:

```ts transpile
const canvas = document.createElement("canvas");

canvas.width = screenshot.width;
canvas.height = screenshot.height;

const context = canvas.getContext("2d")!;
const imageData = new ImageData(
  new Uint8ClampedArray(screenshot.data),
  screenshot.width,
  screenshot.height,
);
context.putImageData(imageData, 0, 0);
```

### Save the canvas into a PNG file

```ts transpile
const url = canvas.toDataURL();
const a = document.createElement("a");
a.href = url;
a.download = `screenshot.png`;
a.click();
```
