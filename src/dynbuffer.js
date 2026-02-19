import iconv from 'iconv-lite';
import { promisify } from 'node:util';
import zlib from 'node:zlib';

const deflate = promisify(zlib.deflate);
const inflate = promisify(zlib.inflate);

const deflateRaw = promisify(zlib.deflateRaw);
const inflateRaw = promisify(zlib.inflateRaw);

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

const brotliCompress = promisify(zlib.brotliCompress);
const brotliDecompress = promisify(zlib.brotliDecompress);

/**
 * @module DynBuffer
 */
export class DynBuffer {
  /**
   * Initialize a new stream utilizing Buffer and ArrayBuffer with the recommended max byte length
   * @private
   * @type {Buffer}
   * @see https://tc39.es/ecma262/multipage/structured-data.html#sec-resizable-arraybuffer-guidelines
   */
  #stream;
  /**
   * The current position in the buffer
   * @private
   * @type {number}
   */
  #position;
  /**
   * The byte order
   * @private
   * @type {'BE'|'LE'}
   * @default 'BE' - Defaults to BE for big endian
   */
  #endian;

  /**
   * Creates a new DynBuffer
   */
  constructor() {
    this.#stream = Buffer.from(new ArrayBuffer(0, { maxByteLength: 2 ** 30 }));
    this.#position = 0;
    this.#endian = 'BE';
  }

  /**
   * Overwrite for inspecting on the DynBuffer class
   * @param {number} depth
   * @param {import('util').InspectOptionsStylized} options
   * @param {typeof import('util').inspect} inspect
   * @returns {string}
   */
  [Symbol.for('nodejs.util.inspect.custom')](depth, options, inspect) {
    return `${options.stylize('DynBuffer', 'special')} {
      \r  stream: ${inspect(this.#stream, options)},
      \r  position: ${options.stylize(this.#position, 'number')},
      \r  length: ${options.stylize(this.length, 'number')},
      \r  bytesAvailable: ${options.stylize(this.bytesAvailable, 'number')},
      \r  endian: '${options.stylize(this.#endian, 'string')}'
    \r}`;
  }

  /**
   * Returns the number of bytes available from the current position in the buffer
   * @returns {number}
   */
  get bytesAvailable() {
    return (this.#stream.length - this.#position);
  }

  /**
   * Returns the whole buffer
   * @returns {Buffer}
   */
  get stream() {
    return this.#stream;
  }

  /**
   * Returns the length of the buffer
   * @returns {number}
   */
  get length() {
    return this.#stream.length;
  }

  /**
   * Sets the length of the buffer
   * @param {number} value - The length to set the buffer to
   */
  set length(value) {
    if (value === 0) {
      this.#stream = Buffer.from(new ArrayBuffer(0, { maxByteLength: 2 ** 30 }));
      this.#position = 0;
    } else if (value > this.#stream.length) { // Larger than the current length, the right side of the buffer is filled with zeros
      const toFill = (value - this.#stream.length);

      this.#ensureCapacity(toFill);
    } else { // Smaller than the current length, the buffer is truncated
      this.#stream = this.#stream.subarray(0, value);
      this.#stream.buffer.resize(value);
      this.#position = value;
    }
  }

  /**
   * Returns the current position in the buffer
   * @returns {number}
   */
  get position() {
    return this.#position;
  }

  /**
   * Sets the current position in the buffer
   * @param {number} value - The value to set the position to
   */
  set position(value) {
    this.#position = value;
  }

  /**
   * Returns the byte order
   * @returns {'BE'|'LE'}
   */
  get endian() {
    return this.#endian;
  }

  /**
   * Sets the byte order
   * @param {'BE'|'LE'} value - The endianness to set the byte order to, either BE for big endian, or LE for little endian
   */
  set endian(value) {
    this.#endian = value;
  }

  /**
   * Ensures there's enough capacity to write X amount of bytes to the buffer, and if not, it'll resize the buffer appropriately
   * @private
   * @param {number} bytes - The initial amount of bytes needed to be written
   */
  #ensureCapacity(bytes) {
    if (this.bytesAvailable < bytes) {
      const newLength = (this.#stream.length + (bytes - this.bytesAvailable));

      this.#stream.buffer.resize(newLength);
    }
  }

  /**
   * A simple wrapper around executing functions on the Buffer class
   * @private
   * @param {string} func - The function name to execute
   * @param {number} bytes - The amount of bytes to ensure capacity and increment the position with
   * @param {number} [value] - The value to write to the buffer
   * @returns {number|undefined} When reading, a value is returned
   */
  #executeCall(func, bytes, value) {
    func = (bytes === 1) ? func : `${func}${this.#endian}`;

    if (arguments.length === 3) { // Write
      this.#ensureCapacity(bytes);
      this.#stream[func](value, this.#position);
      this.#position += bytes;
    } else { // Read
      const value = this.#stream[func](this.#position);

      this.#position += bytes;

      return value;
    }
  }

  /**
   * Converts the buffer to string
   * @param {'ascii'|'utf8'|'utf16le'|'ucs2'|'base64'|'base64url'|'latin1'|'binary'|'hex'} [encoding=utf8] - The encoding set to encode the buffer to
   * @param {boolean} [prettyHex=false] - When using hex for encoding, define if the hex string is pretty (with spacing and formatted) or not
   * @returns {string} The buffer represented as a string
   */
  toString(encoding = 'utf8', prettyHex = false) {
    if (encoding === 'hex' && prettyHex) {
      return this.#stream.toString('hex').match(/.{1,2}/g)?.join(' ');
    }

    return this.#stream.toString(encoding);
  }

  /**
   * Clears the contents of the buffer and resets the position to 0
   */
  clear() {
    this.length = 0;
  }

  /**
   * Compresses the buffer
   * @param {'zlib'|'deflate'|'gzip'|'brotli'} [algorithm=zlib] - The algorithm to compress the buffer with
   * @throws {ReferenceError} The value must be a valid compression algorithm
   */
  async compress(algorithm = 'zlib') {
    if (this.length === 0) return; // Don't try to compress when there's nothing to compress

    const bytes = (algorithm === 'zlib') ? await deflate(this.#stream, { level: zlib.constants.Z_BEST_COMPRESSION }) :
      (algorithm === 'deflate') ? await deflateRaw(this.#stream) :
        (algorithm === 'gzip') ? await gzip(this.#stream) :
          (algorithm === 'brotli') ? await brotliCompress(this.#stream) : undefined;

    if (!bytes) {
      throw new ReferenceError('Invalid compression algorithm.');
    }

    this.position = 0; // The position has to be set to 0 so that we can start writing the compressed bytes to the beginning
    this.writeBytes(bytes);
  }

  /**
   * Decompresses the buffer
   * @param {'zlib'|'deflate'|'gzip'|'brotli'} [algorithm=zlib] - The algorithm to decompress the buffer with
   * @throws {ReferenceError} The value must be a valid compression algorithm
   */
  async uncompress(algorithm = 'zlib') {
    if (this.length === 0) return; // Don't try to uncompress when there's nothing to uncompress

    const bytes = (algorithm === 'zlib') ? await inflate(this.#stream, { level: zlib.constants.Z_BEST_COMPRESSION }) :
      (algorithm === 'deflate') ? await inflateRaw(this.#stream) :
        (algorithm === 'gzip') ? await gunzip(this.#stream) :
          (algorithm === 'brotli') ? await brotliDecompress(this.#stream) : undefined;

    if (!bytes) {
      throw new ReferenceError('Invalid compression algorithm.');
    }

    this.length = bytes.length; // Resize the buffer to the needed length of uncompressed data
    this.position = 0; // The position has to be set to 0 so that we can start writing the uncompressed bytes to the beginning
    this.writeBytes(bytes);
    this.position = 0; // Reset the position back to 0 so that the program can immediately start reading from the beginning
  }

  /**
   * Writes a signed byte
   * @param {number} value - The signed byte to write to the buffer
   */
  writeByte(value) {
    this.#executeCall('writeInt8', 1, value);
  }

  /**
   * Reads a signed byte from the buffer
   * @returns {number} The signed byte
   */
  readByte() {
    return this.#executeCall('readInt8', 1);
  }

  /**
   * Writes an unsigned byte
   * @param {number} value - The unsigned byte to write to the buffer
   */
  writeUnsignedByte(value) {
    this.#executeCall('writeUInt8', 1, value);
  }

  /**
   * Reads an unsigned byte from the buffer
   * @returns {number} The unsigned byte
   */
  readUnsignedByte() {
    return this.#executeCall('readUInt8', 1);
  }

  /**
   * Writes a sequence of 'length' bytes from the specified buffer, 'bytes', starting 'position' (zero-based index) bytes
   * @param {DynBuffer} bytes - The DynBuffer to write the bytes from, and into the buffer
   * @param {number} [position=0] - A zero-based index indicating the position into the array to begin writing
   * @param {number} [length=0] - An unsigned integer indicating how far into the buffer to write
   */
  writeBytes(bytes, position = 0, length = 0) {
    // Internal support for 'writeMultiByte' to write itself
    if (Buffer.isBuffer(bytes)) {
      bytes = { stream: bytes, length: bytes.length };
    }

    if (length === 0) {
      length = (bytes.length - position);
    }

    if (position > bytes.length) {
      position = bytes.length;
    }

    this.#ensureCapacity(length);

    for (let i = 0; i < length; i++) {
      this.#stream[i + this.#position] = bytes.stream[i + position];
    }

    this.#position += length;
  }

  /**
   * Reads the number of data bytes, specified by the 'length' parameter, from the buffer
   * The bytes are read into the DynBuffer object specified by the 'bytes' parameter
   * The bytes are written into the destination DynBuffer starting at the position specified by 'position'
   * @param {DynBuffer} bytes - The DynBuffer to read data into
   * @param {number} [position=0] - The position at which the read data should be written
   * @param {number} [length=0] - The number of bytes to read
   */
  readBytes(bytes, position = 0, length = 0) {
    if (length === 0) {
      length = this.bytesAvailable;
    }

    if ((position + length) >= bytes.length) {
      bytes.#ensureCapacity(position + length);
    }

    for (let i = 0; i < length; i++) {
      bytes.stream[i + position] = this.#stream[i + this.#position];
    }

    this.#position += length;
  }

  /**
   * Writes a boolean based value
   * @param {boolean|number} value - The boolean based value to write to the buffer
   */
  writeBoolean(value) {
    this.writeByte(value ? 1 : 0);
  }

  /**
   * Reads a boolean based value from the buffer
   * @returns {boolean} The boolean based value
   */
  readBoolean() {
    return (this.readByte() !== 0);
  }

  /**
   * Writes a signed short
   * @param {number} value - The signed short to write to the buffer
   */
  writeShort(value) {
    this.#executeCall('writeInt16', 2, value);
  }

  /**
   * Reads a signed short from the buffer
   * @returns {number} The signed short
   */
  readShort() {
    return this.#executeCall('readInt16', 2);
  }

  /**
   * Writes an unsigned short
   * @param {number} value - The unsigned short to write to the buffer
   */
  writeUnsignedShort(value) {
    this.#executeCall('writeUInt16', 2, value);
  }

  /**
   * Reads an unsigned short from the buffer
   * @returns {number} The unsigned short
   */
  readUnsignedShort() {
    return this.#executeCall('readUInt16', 2);
  }

  /**
   * Writes a signed int
   * @param {number} value - The signed int to write to the buffer
   */
  writeInt(value) {
    this.#executeCall('writeInt32', 4, value);
  }

  /**
   * Reads a signed int from the buffer
   * @returns {number} The signed int
   */
  readInt() {
    return this.#executeCall('readInt32', 4);
  }

  /**
   * Writes an unsigned int
   * @param {number} value - The unsigned int to write to the buffer
   */
  writeUnsignedInt(value) {
    this.#executeCall('writeUInt32', 4, value);
  }

  /**
   * Reads an unsigned int from the buffer
   * @returns {number} The unsigned int
   */
  readUnsignedInt() {
    return this.#executeCall('readUInt32', 4);
  }

  /**
   * Writes an IEEE 754 single-precision (32-bit) floating-point number
   * @param {number} value - The IEEE 754 single-precision (32-bit) floating-point number to write to the buffer
   */
  writeFloat(value) {
    this.#executeCall('writeFloat', 4, value);
  }

  /**
   * Reads an IEEE 754 single-precision (32-bit) floating-point number from the buffer
   * @returns {number} The IEEE 754 single-precision (32-bit) floating-point number
   */
  readFloat() {
    return this.#executeCall('readFloat', 4);
  }

  /**
   * Writes an IEEE 754 double-precision (64-bit) floating-point number
   * @param {number} value - The IEEE 754 double-precision (64-bit) floating-point number to write to the buffer
   */
  writeDouble(value) {
    this.#executeCall('writeDouble', 8, value);
  }

  /**
   * Reads an IEEE 754 double-precision (64-bit) floating-point number from the buffer
   * @returns {number} The IEEE 754 double-precision (64-bit) floating-point number
   */
  readDouble() {
    return this.#executeCall('readDouble', 8);
  }

  /**
   * Writes a signed long
   * @param {bigint} value - The signed long to write to the buffer
   */
  writeLong(value) {
    this.#executeCall('writeBigInt64', 8, value);
  }

  /**
   * Reads a signed long from the buffer
   * @returns {bigint} The signed long
   */
  readLong() {
    return this.#executeCall('readBigInt64', 8);
  }

  /**
   * Writes an unsigned long
   * @param {bigint} value - The unsigned long to write to the buffer
   */
  writeUnsignedLong(value) {
    this.#executeCall('writeBigUint64', 8, value);
  }

  /**
   * Reads an unsigned long from the buffer
   * @returns {bigint} The unsigned long
   */
  readUnsignedLong() {
    return this.#executeCall('readBigUint64', 8);
  }

  /**
   * Writes a multibyte string using the specified character set
   * @param {string} value - The multibyte string to write to the buffer
   * @param {string} [charSet=utf8] - The character set to encode the value with
   * @param {boolean} [source=false] - An internal parameter used for writeUTF to write the length of the string
   * @throws {Error} The character set must exist
   */
  writeMultiByte(value, charSet = 'utf8', source = false) {
    if (!iconv.encodingExists(charSet)) {
      throw new Error('Invalid encoding for writeMultiByte.');
    }

    const encoded = iconv.encode(value, charSet, { addBOM: false });

    // Internal support for 'writeUTF' to write its length
    if (source) {
      this.writeUnsignedShort(encoded.length);
    }

    this.writeBytes(encoded, 0, encoded.length);
  }

  /**
   * Reads a multibyte string of specified length from the buffer using the specified character set
   * @param {number} length - The number of bytes to read
   * @param {string} [charSet=utf8] - The character set to decode the value to
   * @returns {string} The multibyte string
   * @throws {Error} The character set must exist
   */
  readMultiByte(length, charSet = 'utf8') {
    if (!iconv.encodingExists(charSet)) {
      throw new Error('Invalid encoding for readMultiByte.');
    }

    const buffer = this.#stream.subarray(this.#position, this.#position + length);
    const value = iconv.decode(buffer, charSet);

    this.#position += length;

    return value;
  }

  /**
   * Writes a UTF-8 string
   * @param {string} value - The UTF-8 string to write to the buffer
   */
  writeUTF(value) {
    this.writeMultiByte(value, 'utf8', true);
  }

  /**
   * Reads a UTF-8 string from the buffer
   * @returns {string} The UTF-8 string
   */
  readUTF() {
    return this.readMultiByte(this.readUnsignedShort());
  }

  /**
   * Writes a UTF-8 string but without the length of the string
   * @param {string} value - The UTF-8 string to write to the buffer
   */
  writeUTFBytes(value) {
    this.writeMultiByte(value);
  }

  /**
   * Reads a sequence of UTF-8 bytes, specified by the length parameter, from the buffer
   * @param {number} length - The number of bytes to read
   * @returns {string} The UTF-8 string
   */
  readUTFBytes(length) {
    return this.readMultiByte(length);
  }
}