---
sidebar_position: 6
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# Create ADB instance

While transports contains the lower-level logic to communicate with devices, the `Adb` class provides a higher-level abstraction over ADB protocol and ADB commands.

This step only initialize some internal states, but does not actually send any packets to the device.

```ts transpile
import { Adb } from "@yume-chan/adb";

const adb: Adb = new Adb(transport);
```

See [commands](../commands/overview.md) for how to use the `Adb` instance.
