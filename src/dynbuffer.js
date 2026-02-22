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
 * @author SeirDotExe
 * @license BSD-3-Clause
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
   * @param {number} depth - The 'depth' param of util.inspect
   * @param {Object} options - The util.InspectOptionsStylized options
   * @param {Function} inspect - The util.inspect function
   * @returns {string} A pretty printed representation of the DynBuffer class
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
    if (value === 0) { // Clear the buffer
      this.#stream = Buffer.from(new ArrayBuffer(0, { maxByteLength: 2 ** 30 }));
      this.#position = 0;
    } else if (value > this.#stream.length) { // Larger than the current length, the right side of the buffer is filled with zeros
      this.#ensureCapacity(value - this.#stream.length);
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
   * @param {string} method - The function name to execute
   * @param {number} bytes - The amount of bytes to ensure capacity and increment the position with
   * @param {number} [value] - The value to write to the buffer
   * @returns {number|undefined} When reading, a value is returned
   * @throws {RangeError} When reading, there must be sufficient data available to read
   */
  #executeCall(method, bytes, value) {
    method = (bytes === 1) ? method : `${method}${this.#endian}`; // Methods with 1 byte have no endianness

    if (arguments.length === 3) { // Write when 'value' argument is present
      this.#ensureCapacity(bytes);
      this.#stream[method](value, this.#position);
      this.#position += bytes;
    } else { // Read
      if (this.bytesAvailable === 0) {
        throw new RangeError('There is not sufficient data available to read.');
      }

      const value = this.#stream[method](this.#position);

      this.#position += bytes;

      return value;
    }
  }

  /**
   * Converts an unsigned integer as a signed integer with the given bit width (two's complement)
   * @private
   * @param {number} value - The unsigned integer value to sign
   * @param {number} bits - The number of bits the value should be treated as
   * @returns {number} The signed integer representation of the value
   */
  #signedOverflow(value, bits) {
    const sign = 1 << (bits - 1);

    return (value & (sign - 1)) - (value & sign);
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
   * @async
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
      throw new ReferenceError(`Invalid compression algorithm '${algorithm}' for compress.`);
    }

    this.position = 0; // The position has to be set to 0 so that we can start writing the compressed bytes to the beginning
    this.writeBytes(bytes);
  }

  /**
   * Decompresses the buffer
   * @async
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
      throw new ReferenceError(`Invalid compression algorithm '${algorithm}' for uncompress.`);
    }

    this.length = bytes.length; // Resize the buffer to the needed length of uncompressed data
    this.position = 0; // The position has to be set to 0 so that we can start writing the uncompressed bytes to the beginning
    this.writeBytes(bytes);
    this.position = 0; // Reset the position back to 0 so that the program can immediately start reading from the beginning
  }

  /**
   * Writes a byte
   * @param {number} value - The byte to write to the buffer
   */
  writeByte(value) {
    this.#executeCall('writeInt8', 1, this.#signedOverflow(value, 8));
  }

  /**
   * Reads a signed byte from the buffer
   * @returns {number} The signed byte
   */
  readByte() {
    return this.#executeCall('readInt8', 1);
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
   * @param {DynBuffer|Buffer} bytes - The DynBuffer (or Buffer) to write the bytes from, and into the buffer
   * @param {number} [position=0] - A zero-based index indicating the position into the array to begin writing
   * @param {number} [length=0] - An unsigned integer indicating how far into the buffer to write
   * @throws {RangeError} If the given length is greater than the remaining space in the destination buffer
   */
  writeBytes(bytes, position = 0, length = 0) {
    if (!bytes?.stream && Buffer.isBuffer(bytes)) {
      bytes = { stream: bytes, length: bytes.length };
    }

    position = Math.min(position, bytes.length);
    length = (length === 0) ? (bytes.length - position) : length;

    if (length > (bytes.length - position)) {
      throw new RangeError('The supplied index is out of bounds.');
    }

    this.#ensureCapacity(length);

    bytes.stream.copy(this.#stream, this.#position, position, position + length);

    this.#position += length;
  }

  /**
   * Reads the number of data bytes, specified by the 'length' parameter, from the buffer
   * The bytes are read into the DynBuffer object specified by the 'bytes' parameter
   * The bytes are written into the destination DynBuffer starting at the position specified by 'position'
   * @param {DynBuffer} bytes - The DynBuffer to read data into
   * @param {number} [position=0] - The position at which the read data should be written
   * @param {number} [length=0] - The number of bytes to read
   * @throws {RangeError} If the given length is greater than the amount of bytes available
   */
  readBytes(bytes, position = 0, length = 0) {
    length = (length === 0) ? this.bytesAvailable : length;

    if (length > this.bytesAvailable) {
      throw new RangeError('End of buffer was encountered.');
    }

    bytes.length = Math.max(bytes.length, position + length);

    this.#stream.copy(bytes.stream, position, this.#position, length);

    this.#position += length;
  }

  /**
   * Writes a boolean based value
   * @param {boolean|number} value - The boolean based value to write to the buffer
   */
  writeBoolean(value) {
    if (value instanceof Boolean) {
      value = value.valueOf();
    }

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
   * Writes a 16-bit integer
   * @param {number} value - The 16-bit integer to write to the buffer
   */
  writeShort(value) {
    this.#executeCall('writeInt16', 2, this.#signedOverflow(value, 16));
  }

  /**
   * Reads a signed 16-bit integer from the buffer
   * @returns {number} The signed 16-bit integer
   */
  readShort() {
    return this.#executeCall('readInt16', 2);
  }

  /**
   * Reads an unsigned 16-bit integer from the buffer
   * @returns {number} The unsigned 16-bit integer
   */
  readUnsignedShort() {
    return this.#executeCall('readUInt16', 2);
  }

  /**
   * Writes a 32-bit signed integer
   * @param {number} value - The 32-bit signed integer to write to the buffer
   */
  writeInt(value) {
    this.#executeCall('writeInt32', 4, value);
  }

  /**
   * Reads a signed 32-bit integer from the buffer
   * @returns {number} The signed 32-bit integer
   */
  readInt() {
    return this.#executeCall('readInt32', 4);
  }

  /**
   * Writes an unsigned 32-bit integer
   * @param {number} value - The unsigned 32-bit integer to write to the buffer
   */
  writeUnsignedInt(value) {
    this.#executeCall('writeUInt32', 4, value);
  }

  /**
   * Reads an unsigned 32-bit integer from the buffer
   * @returns {number} The unsigned 32-bit integer
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
   * @see https://github.com/pillarjs/iconv-lite/wiki/Supported-Encodings
   * @param {string} value - The multibyte string to write to the buffer
   * @param {string} [charSet=utf8] - The character set to encode the value with
   * @param {boolean} [source=false] - An internal parameter used for writeUTF to write the length of the string
   * @throws {Error} The character set must exist
   */
  writeMultiByte(value, charSet = 'utf8', source = false) {
    if (!iconv.encodingExists(charSet)) {
      throw new Error(`Invalid encoding '${charSet}' for writeMultiByte.`);
    }

    const encoded = iconv.encode(value, charSet, { addBOM: false });

    // Internal support for 'writeUTF' to write its length
    if (source) {
      this.writeShort(encoded.length);
    }

    this.writeBytes(encoded, 0, encoded.length);
  }

  /**
   * Reads a multibyte string of specified length from the buffer using the specified character set
   * @see https://github.com/pillarjs/iconv-lite/wiki/Supported-Encodings
   * @param {number} length - The number of bytes to read
   * @param {string} [charSet=utf8] - The character set to decode the value to
   * @returns {string} The multibyte string
   * @throws {Error} The character set must exist
   */
  readMultiByte(length, charSet = 'utf8') {
    if (!iconv.encodingExists(charSet)) {
      throw new Error(`Invalid encoding '${charSet}' for readMultiByte.`);
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