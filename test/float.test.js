import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import DynBuffer from '../index.js';

describe('float test', () => {
  it('should support writing and reading a float', () => {
    const dynbuf = new DynBuffer();

    dynbuf.writeFloat(0.0);
    dynbuf.writeFloat(Math.PI);
    dynbuf.writeFloat(Infinity);
    dynbuf.writeFloat(-Infinity);
    dynbuf.writeFloat(NaN);
    dynbuf.writeFloat(Number.MAX_SAFE_INTEGER);
    dynbuf.writeFloat(Number.MIN_SAFE_INTEGER);
    dynbuf.writeFloat(123.456);

    dynbuf.position = 0;

    assert.equal(dynbuf.readFloat(), 0);
    assert.equal(dynbuf.readFloat(), 3.1415927410125732);
    assert.equal(dynbuf.readFloat(), Infinity);
    assert.equal(dynbuf.readFloat(), -Infinity);
    assert.equal(dynbuf.readFloat(), NaN);
    assert.equal(dynbuf.readFloat(), Number.MAX_SAFE_INTEGER + 1);
    assert.equal(dynbuf.readFloat(), Number.MIN_SAFE_INTEGER - 1);
    assert.equal(Math.round(dynbuf.readFloat() * 1000) / 1000, 123.456);

    assert.equal(dynbuf.length, 32);
    assert.equal(dynbuf.position, 32);
    assert.equal(dynbuf.bytesAvailable, 0);
  });
});