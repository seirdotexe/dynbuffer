import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import DynBuffer from '../index.js';

describe('byte test', () => {
  it('should support writing and reading a byte', () => {
    const dynbuf = new DynBuffer();

    dynbuf.writeByte(100);
    dynbuf.writeByte(-128);
    dynbuf.writeByte(127);

    dynbuf.position = 0;

    assert.equal(dynbuf.readByte(), 100);
    assert.equal(dynbuf.readByte(), -128);
    assert.equal(dynbuf.readByte(), 127);

    assert.equal(dynbuf.length, 3);
    assert.equal(dynbuf.position, 3);
    assert.equal(dynbuf.bytesAvailable, 0);
  });

  it('should support signed overflow when writing a byte', () => {
    const dynbuf = new DynBuffer();

    dynbuf.writeByte(255);
    dynbuf.writeByte(-200);
    dynbuf.writeByte(128);

    dynbuf.position = 0;

    assert.equal(dynbuf.readUnsignedByte(), 255);
    assert.equal(dynbuf.readUnsignedByte(), 56);
    assert.equal(dynbuf.readUnsignedByte(), 128);

    assert.equal(dynbuf.length, 3);
    assert.equal(dynbuf.position, 3);
    assert.equal(dynbuf.bytesAvailable, 0);
  });
});