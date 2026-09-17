import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import DynBuffer from '../index.js';

describe('length', () => {
  it('should clear the buffer when set to 0', () => {
    const dynbuf = new DynBuffer();

    dynbuf.writeByte(1);
    dynbuf.writeByte(2);
    dynbuf.writeByte(3);

    assert.equal(dynbuf.length, 3);
    assert.equal(dynbuf.position, 3);

    dynbuf.length = 0;

    assert.equal(dynbuf.length, 0);
    assert.equal(dynbuf.position, 0);
    assert.equal(dynbuf.bytesAvailable, 0);
  });

  it('should clear the buffer and reset position when set to 0', () => {
    const dynbuf = new DynBuffer();

    dynbuf.writeByte(1);
    dynbuf.writeByte(2);
    dynbuf.writeByte(3);

    dynbuf.position = 1;
    dynbuf.length = 0;

    assert.equal(dynbuf.length, 0);
    assert.equal(dynbuf.position, 0);
    assert.equal(dynbuf.bytesAvailable, 0);
  });

  it('should increase the length', () => {
    const dynbuf = new DynBuffer();

    dynbuf.writeByte(1);
    dynbuf.writeByte(2);
    dynbuf.writeByte(3);

    dynbuf.length = 5;

    assert.equal(dynbuf.length, 5);
  });

  it('should preserve existing data when increasing the length', () => {
    const dynbuf = new DynBuffer();

    dynbuf.writeByte(1);
    dynbuf.writeByte(2);
    dynbuf.writeByte(3);

    dynbuf.length = 5;
    dynbuf.position = 0;

    assert.equal(dynbuf.readByte(), 1);
    assert.equal(dynbuf.readByte(), 2);
    assert.equal(dynbuf.readByte(), 3);
  });

  it('should fill the new space with zeros when increasing the length', () => {
    const dynbuf = new DynBuffer();

    dynbuf.writeByte(1);
    dynbuf.writeByte(2);

    dynbuf.length = 5;
    dynbuf.position = 0;

    assert.equal(dynbuf.readByte(), 1);
    assert.equal(dynbuf.readByte(), 2);
    assert.equal(dynbuf.readByte(), 0);
    assert.equal(dynbuf.readByte(), 0);
    assert.equal(dynbuf.readByte(), 0);
  });

  it('should preserve position when increasing the length', () => {
    const dynbuf = new DynBuffer();

    dynbuf.writeByte(1);
    dynbuf.writeByte(2);
    dynbuf.writeByte(3);

    dynbuf.position = 1;
    dynbuf.length = 5;

    assert.equal(dynbuf.length, 5);
    assert.equal(dynbuf.position, 1);
    assert.equal(dynbuf.bytesAvailable, 4);
  });

  it('should truncate the buffer when the length is decreased', () => {
    const dynbuf = new DynBuffer();

    dynbuf.writeByte(1);
    dynbuf.writeByte(2);
    dynbuf.writeByte(3);
    dynbuf.writeByte(4);
    dynbuf.writeByte(5);

    dynbuf.length = 3;

    assert.equal(dynbuf.length, 3);
    assert.equal(dynbuf.position, 3);
    assert.equal(dynbuf.bytesAvailable, 0);
  });

  it('should preserve data up to the new length when truncating', () => {
    const dynbuf = new DynBuffer();

    dynbuf.writeByte(1);
    dynbuf.writeByte(2);
    dynbuf.writeByte(3);
    dynbuf.writeByte(4);
    dynbuf.writeByte(5);

    dynbuf.length = 3;
    dynbuf.position = 0;

    assert.equal(dynbuf.readByte(), 1);
    assert.equal(dynbuf.readByte(), 2);
    assert.equal(dynbuf.readByte(), 3);
  });

  it('should discard data beyond the new length when truncating', () => {
    const dynbuf = new DynBuffer();

    dynbuf.writeByte(1);
    dynbuf.writeByte(2);
    dynbuf.writeByte(3);
    dynbuf.writeByte(4);
    dynbuf.writeByte(5);

    dynbuf.length = 3;

    assert.equal(dynbuf.length, 3);
    assert.equal(dynbuf.position, 3);

    dynbuf.position = 0;

    assert.equal(dynbuf.readByte(), 1);
    assert.equal(dynbuf.readByte(), 2);
    assert.equal(dynbuf.readByte(), 3);
    assert.equal(dynbuf.bytesAvailable, 0);
  });

  it('should set position to the new length when truncating', () => {
    const dynbuf = new DynBuffer();

    dynbuf.writeByte(1);
    dynbuf.writeByte(2);
    dynbuf.writeByte(3);

    dynbuf.position = 1;
    dynbuf.length = 2;

    assert.equal(dynbuf.length, 2);
    assert.equal(dynbuf.position, 2);
    assert.equal(dynbuf.bytesAvailable, 0);
  });

  it('should set position to the length when setting the same length', () => {
    const dynbuf = new DynBuffer();

    dynbuf.writeByte(1);
    dynbuf.writeByte(2);

    dynbuf.position = 1;
    dynbuf.length = 2;

    assert.equal(dynbuf.length, 2);
    assert.equal(dynbuf.position, 2);
    assert.equal(dynbuf.bytesAvailable, 0);
  });

  it('should preserve data when setting the same length', () => {
    const dynbuf = new DynBuffer();

    dynbuf.writeByte(1);
    dynbuf.writeByte(2);

    dynbuf.length = 2;
    dynbuf.position = 0;

    assert.equal(dynbuf.readByte(), 1);
    assert.equal(dynbuf.readByte(), 2);
    assert.equal(dynbuf.bytesAvailable, 0);
  });
});