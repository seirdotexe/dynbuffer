# dynbuffer

DynBuffer is a library to easily manipulate bytes. It auto positions for you and expands the buffer by itself. It's made for developers who write back-end code and need direct byte manipulation without all the hassle!

# Requirements and installation

Requires Node V20 and up.

> npm install @seirdotexe/dynbuffer

# Example

The entire class is well documented and is accessible [here](https://seirdotexe.github.io/dynbuffer-api/).

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