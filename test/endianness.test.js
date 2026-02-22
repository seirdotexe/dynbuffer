import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import DynBuffer from '../index.js';

describe('endianness test', () => {
  it('should support endianness', () => {
    const dynbuf = new DynBuffer();

    dynbuf.writeUTF('High');
    dynbuf.writeInt(33550336);
    dynbuf.writeBoolean(true);

    dynbuf.endian = 'LE';

    dynbuf.writeUTF('Low')
    dynbuf.writeDouble(8589869056);
    dynbuf.writeBoolean(false);

    dynbuf.position = 0;

    dynbuf.endian = 'BE';
    assert.equal(dynbuf.readUTF(), 'High');
    assert.equal(dynbuf.readInt(), 33550336);
    assert.equal(dynbuf.readBoolean(), true);

    dynbuf.endian = 'LE'
    assert.equal(dynbuf.readUTF(), 'Low');
    assert.equal(dynbuf.readDouble(), 8589869056);
    assert.equal(dynbuf.readBoolean(), false);
  });
});