import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import DynBuffer from '../index.js';

describe('byte test', () => {
  it('should support writing and reading a simple string', () => {
    const dynbuf = new DynBuffer();

    dynbuf.writeUTF('Hello world');

    dynbuf.position = 0;

    assert.equal(dynbuf.stream[1], 11);
    assert.equal(dynbuf.readUTF(), 'Hello world');
  });

  it('should support writing and reading a long string', () => {
    const dynbuf = new DynBuffer();

    dynbuf.writeUTF('A'.repeat(65535));
    assert.throws(() => dynbuf.writeUTF('B'.repeat(65536)))

    dynbuf.position = 0;

    assert.equal(dynbuf.readUTF(), 'A'.repeat(65535));
  });

  it('should support writing and reading different character sets', () => {
    // Multi byte and character sets in Actionscript 3 is fundamentally flawed and outdated at this age.
    // No true utf8 but instead windows-1252. We won't pursue this legacy format, and follow iconv-lite standards!
    const dynbuf = new DynBuffer();

    const str1 = 'Olá Mundo!';
    const str2 = 'こんにちは';
    const str3 = '日本語';
    const str4 = 'Café au lait';
    const str5 = '繁體中文';
    const str6 = '𝄞';
    const str7 = 'Привет мир';
    const str8 = 'سلام دنیا';
    const str9 = '안녕하세요';
    const str10 = 'Symbols: ☺ ☃ ❤ € ¥ and Spécial çharacters! @$%^&*';

    dynbuf.writeMultiByte(str1, 'iso-8859-1');
    dynbuf.writeMultiByte(str2, 'shift-jis');
    dynbuf.writeMultiByte(str3, 'euc-jp');
    dynbuf.writeMultiByte(str4, 'windows-1252');
    dynbuf.writeMultiByte(str5, 'big5');
    dynbuf.writeMultiByte(str6, 'utf-32');
    dynbuf.writeMultiByte(str7, 'iso-8859-5');
    dynbuf.writeMultiByte(str8, 'utf-16be');
    dynbuf.writeMultiByte(str9, 'utf-16le');
    dynbuf.writeMultiByte(str10);

    dynbuf.position = 0;

    assert.equal(dynbuf.readMultiByte(str1.length, 'iso-8859-1'), str1);
    assert.equal(dynbuf.readMultiByte(str2.length * 2, 'shift-jis'), str2);
    assert.equal(dynbuf.readMultiByte(str3.length * 2, 'euc-jp'), str3);
    assert.equal(dynbuf.readMultiByte(str4.length, 'windows-1252'), str4);
    assert.equal(dynbuf.readMultiByte(str5.length * 2, 'big5'), str5);
    assert.equal(dynbuf.readMultiByte(str6.length * 2, 'utf-32'), str6);
    assert.equal(dynbuf.readMultiByte(str7.length, 'iso-8859-5'), str7);
    assert.equal(dynbuf.readMultiByte(str8.length * 2, 'utf-16be'), str8);
    assert.equal(dynbuf.readMultiByte(str9.length * 2, 'utf-16le'), str9);
    assert.equal(dynbuf.readMultiByte(str10.length * 2), str10);
  });
});