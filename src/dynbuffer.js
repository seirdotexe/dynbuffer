import iconv from 'iconv-lite';

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
    if (value > this.#stream.length) { // Larger than the current length, the right side of the buffer is filled with zeros
      // Todo
    } else { // Smaller than the current length, the buffer is truncated
      this.#stream = this.#stream.subarray(0, value);
      this.#position = this.#stream.length;
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
   * Clears the contents of the buffer and resets the position to 0
   */
  clear() {
    this.#position = 0;
    this.length = 0;
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

  writeBytes(bytes, position = 0, length = 0) { /** Todo */ }
  readBytes(bytes, position = 0, length = 0) { /** Todo */ }

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