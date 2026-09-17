import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import DynBuffer from '../index.js';

describe('long test', () => {
  it('should support writing and reading signed long values', () => {
    const dynbuf = new DynBuffer();

    dynbuf.writeLong(0n);
    dynbuf.writeLong(1n);
    dynbuf.writeLong(-1n);
    dynbuf.writeLong(1234567890123456789n);
    dynbuf.writeLong(-1234567890123456789n);

    dynbuf.position = 0;

    assert.equal(dynbuf.readLong(), 0n);
    assert.equal(dynbuf.readLong(), 1n);
    assert.equal(dynbuf.readLong(), -1n);
    assert.equal(dynbuf.readLong(), 1234567890123456789n);
    assert.equal(dynbuf.readLong(), -1234567890123456789n);

    assert.equal(dynbuf.length, 40);
    assert.equal(dynbuf.position, 40);
    assert.equal(dynbuf.bytesAvailable, 0);
  });

  it('should support the minimum and maximum signed long values', () => {
    const dynbuf = new DynBuffer();

    dynbuf.writeLong(-9223372036854775808n);
    dynbuf.writeLong(9223372036854775807n);

    dynbuf.position = 0;

    assert.equal(dynbuf.readLong(), -9223372036854775808n);
    assert.equal(dynbuf.readLong(), 9223372036854775807n);

    assert.equal(dynbuf.length, 16);
    assert.equal(dynbuf.position, 16);
    assert.equal(dynbuf.bytesAvailable, 0);
  });

  it('should support writing and reading unsigned long values', () => {
    const dynbuf = new DynBuffer();

    dynbuf.writeUnsignedLong(0n);
    dynbuf.writeUnsignedLong(1n);
    dynbuf.writeUnsignedLong(1234567890123456789n);

    dynbuf.position = 0;

    assert.equal(dynbuf.readUnsignedLong(), 0n);
    assert.equal(dynbuf.readUnsignedLong(), 1n);
    assert.equal(dynbuf.readUnsignedLong(), 1234567890123456789n);

    assert.equal(dynbuf.length, 24);
    assert.equal(dynbuf.position, 24);
    assert.equal(dynbuf.bytesAvailable, 0);
  });

  it('should support the minimum and maximum unsigned long values', () => {
    const dynbuf = new DynBuffer();

    dynbuf.writeUnsignedLong(0n);
    dynbuf.writeUnsignedLong(18446744073709551615n);

    dynbuf.position = 0;

    assert.equal(dynbuf.readUnsignedLong(), 0n);
    assert.equal(dynbuf.readUnsignedLong(), 18446744073709551615n);

    assert.equal(dynbuf.length, 16);
    assert.equal(dynbuf.position, 16);
    assert.equal(dynbuf.bytesAvailable, 0);
  });

  it('should advance position by 8 bytes when writing a long', () => {
    const dynbuf = new DynBuffer();

    assert.equal(dynbuf.position, 0);

    dynbuf.writeLong(123n);

    assert.equal(dynbuf.position, 8);
    assert.equal(dynbuf.length, 8);
    assert.equal(dynbuf.bytesAvailable, 0);
  });

  it('should advance position by 8 bytes when reading a long', () => {
    const dynbuf = new DynBuffer();

    dynbuf.writeLong(123n);
    dynbuf.position = 0;

    assert.equal(dynbuf.readLong(), 123n);
    assert.equal(dynbuf.position, 8);
    assert.equal(dynbuf.bytesAvailable, 0);
  });

  it('should advance position by 8 bytes when writing an unsigned long', () => {
    const dynbuf = new DynBuffer();

    assert.equal(dynbuf.position, 0);

    dynbuf.writeUnsignedLong(123n);

    assert.equal(dynbuf.position, 8);
    assert.equal(dynbuf.length, 8);
    assert.equal(dynbuf.bytesAvailable, 0);
  });

  it('should advance position by 8 bytes when reading an unsigned long', () => {
    const dynbuf = new DynBuffer();

    dynbuf.writeUnsignedLong(123n);
    dynbuf.position = 0;

    assert.equal(dynbuf.readUnsignedLong(), 123n);
    assert.equal(dynbuf.position, 8);
    assert.equal(dynbuf.bytesAvailable, 0);
  });
});