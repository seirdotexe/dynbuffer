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

dyn.toString('hex', true); // 64 00 0b 48 65 6c 6c 6f 20 77 6f 72 6c 64 00
```

# License

This project applies the BSD-3-Clause license.