import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import DynBuffer from '../index.js';

describe('compress test', () => {
  it('should support compressing and decompressing the buffer', async () => {
    const dynbuf = new DynBuffer();

    dynbuf.writeUTF('This is a test using zlib.');
    await dynbuf.compress('zlib');
    await dynbuf.uncompress('zlib');
    dynbuf.position = 0;
    assert.equal(dynbuf.readUTF(), 'This is a test using zlib.');
    dynbuf.clear();

    dynbuf.writeUTF('This is a test using deflate.');
    await dynbuf.compress('deflate');
    await dynbuf.uncompress('deflate');
    dynbuf.position = 0;
    assert.equal(dynbuf.readUTF(), 'This is a test using deflate.');
    dynbuf.clear();

    dynbuf.writeUTF('This is a test using gzip.');
    await dynbuf.compress('gzip');
    await dynbuf.uncompress('gzip');
    dynbuf.position = 0;
    assert.equal(dynbuf.readUTF(), 'This is a test using gzip.');
    dynbuf.clear();

    dynbuf.writeUTF('This is a test using brotli.');
    await dynbuf.compress('brotli');
    await dynbuf.uncompress('brotli');
    dynbuf.position = 0;
    assert.equal(dynbuf.readUTF(), 'This is a test using brotli.');
    dynbuf.clear();
  });
});