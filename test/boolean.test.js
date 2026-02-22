import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import DynBuffer from '../index.js';

describe('byte test', () => {
  it('should support writing and boolean values', () => {
    const dynbuf = new DynBuffer();

    dynbuf.writeBoolean(true);
    dynbuf.writeBoolean(false);

    dynbuf.writeBoolean(1);
    dynbuf.writeBoolean(0);

    dynbuf.writeBoolean(new Boolean(true));
    dynbuf.writeBoolean(new Boolean(false));

    dynbuf.writeByte(1);
    dynbuf.writeByte(0);

    dynbuf.position = 0;

    assert.equal(dynbuf.readBoolean(), true);
    assert.equal(dynbuf.readBoolean(), false);
    assert.equal(dynbuf.readBoolean(), true);
    assert.equal(dynbuf.readBoolean(), false);
    assert.equal(dynbuf.readBoolean(), true);
    assert.equal(dynbuf.readBoolean(), false);
    assert.equal(dynbuf.readBoolean(), true);
    assert.equal(dynbuf.readBoolean(), false);

    assert.equal(dynbuf.length, 8);
    assert.equal(dynbuf.position, 8);
    assert.equal(dynbuf.bytesAvailable, 0);
  });
});