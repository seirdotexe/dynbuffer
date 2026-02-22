import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import DynBuffer from '../index.js';

describe('short test', () => {
  it('should support writing and reading a short', () => {
    const dynbuf = new DynBuffer();

    dynbuf.writeShort(2500);
    dynbuf.writeShort(-32768);
    dynbuf.writeShort(32767);

    dynbuf.position = 0;

    assert.equal(dynbuf.readShort(), 2500);
    assert.equal(dynbuf.readShort(), -32768);
    assert.equal(dynbuf.readShort(), 32767);

    assert.equal(dynbuf.length, 6);
    assert.equal(dynbuf.position, 6);
    assert.equal(dynbuf.bytesAvailable, 0);
  });

  it('should support signed overflow when writing a short', () => {
    const dynbuf = new DynBuffer();

    dynbuf.writeShort(65535);
    dynbuf.writeShort(-62000);
    dynbuf.writeShort(32768);

    dynbuf.position = 0;

    assert.equal(dynbuf.readUnsignedShort(), 65535);
    assert.equal(dynbuf.readUnsignedShort(), 3536);
    assert.equal(dynbuf.readUnsignedShort(), 32768);

    assert.equal(dynbuf.length, 6);
    assert.equal(dynbuf.position, 6);
    assert.equal(dynbuf.bytesAvailable, 0);
  });
});