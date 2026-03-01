import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import DynBuffer from '../index.js';

describe('bytes test', () => {
  it('simple - should support writing and reading bytes', () => {
    const source = new DynBuffer();
    const target = new DynBuffer();

    source.writeUTFBytes('Hello world');
    target.writeBytes(source);

    target.position = 0;

    assert.equal(source.toString('hex', true), '48 65 6c 6c 6f 20 77 6f 72 6c 64');
    assert.equal(target.toString('hex', true), '48 65 6c 6c 6f 20 77 6f 72 6c 64');
    assert.equal(target.readUTFBytes(target.length), 'Hello world');
  });

  it('errors - should catch out of bounds checks', () => {
    const source = new DynBuffer();
    const target = new DynBuffer();

    source.writeUTFBytes('ABC');
    assert.throws(() => target.writeBytes(source, 0, 4));
    target.writeBytes(source, 0, 3);

    assert.throws(() => target.readBytes(source, 0, 4));
    target.position = 0;

    target.readBytes(source, 0, 3);
    target.position = 0;

    assert.equal(source.toString('hex', true), '41 42 43');
    assert.equal(target.toString('hex', true), '41 42 43');
    assert.equal(target.readUTFBytes(target.length), 'ABC');
  });

  it('position - should support writing and reading bytes', () => {
    const source = new DynBuffer();
    const target = new DynBuffer();

    source.writeUTFBytes('World');
    source.position = 0;

    target.writeUTFBytes('Hello ');
    source.readBytes(target);

    target.position = 0;

    assert.equal(source.toString('hex', true), '57 6f 72 6c 64');
    assert.equal(target.toString('hex', true), '57 6f 72 6c 64 20');
    assert.equal(target.readUTFBytes(target.length), 'World ');
  });

  it('position+length - should support writing and reading bytes', () => {
    const source = new DynBuffer();
    const target = new DynBuffer();

    source.writeUTFBytes('ABCDEFG');
    source.position = 0;

    target.writeBytes(source, 1, 3);
    target.position = 0;

    assert.equal(source.toString('hex', true), '41 42 43 44 45 46 47');
    assert.equal(target.toString('hex', true), '42 43 44');
    assert.equal(target.readUTFBytes(target.length), 'BCD');
  });

  it('data+position+length - should support writing and reading bytes', () => {
    const source = new DynBuffer();
    const target = new DynBuffer();

    source.writeUTFBytes("abcdefgh");
    source.position = 0;

    target.writeByte(0);
    target.writeByte(0);
    target.writeByte(0);

    source.readBytes(target, 1, 4);
    target.position = 1;

    assert.equal(source.toString('hex', true), '61 62 63 64 65 66 67 68');
    assert.equal(target.toString('hex', true), '00 61 62 63 64');
    assert.equal(target.readUTFBytes(target.length), 'abcd');
  });

  it('length - should support writing and reading bytes', () => {
    const source = new DynBuffer();
    const target = new DynBuffer();

    source.writeUTFBytes('1234567890');
    source.position = 0;

    source.readBytes(target, 0, 4);

    assert.equal(source.toString('hex', true), '31 32 33 34 35 36 37 38 39 30');
    assert.equal(target.toString('hex', true), '31 32 33 34');
    assert.equal(target.readUTFBytes(target.length), '1234');
  });

  it('overwrite - should support writing and reading bytes', () => {
    const source = new DynBuffer();
    const target = new DynBuffer();

    source.writeUTFBytes('hi');
    source.position = 0;

    target.writeUTFBytes('abc');
    source.readBytes(target, 5, 2);

    target.position = 0;

    assert.equal(source.toString('hex', true), '68 69');
    assert.equal(target.toString('hex', true), '61 62 63 00 00 68 69');
    assert.equal(target.readUTFBytes(target.length), 'abc\0\0hi');
  });
});