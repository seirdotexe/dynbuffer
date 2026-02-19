# dynbuffer

A wrapper to act as a dynamically resizing buffer utilizing ArrayBuffer and Buffer.

# Example

```js
import DynBuffer from '@seirdotexe/dynbuffer';

const dyn = new DynBuffer();

dyn.writeByte(100);
dyn.writeUTF('Hello world');
dyn.writeBoolean(false);

dyn.position = 0;

dyn.readByte(); // 100
dyn.readUTF(); // Hello world
dyn.readBoolean(); // false
```

# License

This project applies the BSD-3-Clause license.