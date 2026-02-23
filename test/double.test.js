import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import DynBuffer from '../index.js';

describe('double test', () => {
  it('should support writing and reading a double', () => {
    const dynbuf = new DynBuffer();

    dynbuf.writeDouble(0.0);
    dynbuf.writeDouble(1.23);
    dynbuf.writeDouble(Math.PI);
    dynbuf.writeDouble(Infinity);
    dynbuf.writeDouble(-Infinity);
    dynbuf.writeDouble(NaN);
    dynbuf.writeDouble(Number.MAX_VALUE);
    dynbuf.writeDouble(Number.MIN_VALUE);

    dynbuf.position = 0;

    assert.equal(dynbuf.readDouble(), 0);
    assert.equal(dynbuf.readDouble(), 1.23);
    assert.equal(dynbuf.readDouble(), Math.PI);
    assert.equal(dynbuf.readDouble(), Infinity);
    assert.equal(dynbuf.readDouble(), -Infinity);
    assert.equal(dynbuf.readDouble(), NaN);
    assert.equal(dynbuf.readDouble(), Number.MAX_VALUE);
    assert.equal(dynbuf.readDouble(), Number.MIN_VALUE);

    assert.equal(dynbuf.length, 64);
    assert.equal(dynbuf.position, 64);
    assert.equal(dynbuf.bytesAvailable, 0);
  });
});