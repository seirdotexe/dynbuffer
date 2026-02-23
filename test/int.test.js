import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import DynBuffer from '../index.js';

describe('int test', () => {
  it('should support writing and reading a signed int32', () => {
    const dynbuf = new DynBuffer();

    dynbuf.writeInt(-1);
    dynbuf.writeInt(-2147483648);
    dynbuf.writeInt(2147483647);

    dynbuf.position = 0;

    assert.equal(dynbuf.readInt(), -1);
    assert.equal(dynbuf.readInt(), -2147483648);
    assert.equal(dynbuf.readInt(), 2147483647);

    assert.equal(dynbuf.length, 12);
    assert.equal(dynbuf.position, 12);
    assert.equal(dynbuf.bytesAvailable, 0);

    assert.throws(() => dynbuf.writeInt(-2147483649));
    assert.throws(() => dynbuf.writeInt(2147483648));
  });

  it('should support writing and reading an unsigned int32', () => {
    const dynbuf = new DynBuffer();

    dynbuf.writeUnsignedInt(0);
    dynbuf.writeUnsignedInt(4294967295);

    dynbuf.position = 0;

    assert.equal(dynbuf.readUnsignedInt(), 0);
    assert.equal(dynbuf.readUnsignedInt(), 4294967295);

    assert.equal(dynbuf.length, 8);
    assert.equal(dynbuf.position, 8);
    assert.equal(dynbuf.bytesAvailable, 0);

    assert.throws(() => dynbuf.writeUnsignedInt(-1));
    assert.throws(() => dynbuf.writeUnsignedInt(4294967296));
  });
});