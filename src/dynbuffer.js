/**
 * @module DynBuffer
 */
export class DynBuffer {
  /**
   * Initialize a new dataview with the recommended max byte length
   * @private
   * @type {DataView}
   * @see https://tc39.es/ecma262/multipage/structured-data.html#sec-resizable-arraybuffer-guidelines
   */
  #dataview;
  /**
   * The position in the current buffer
   * @private
   * @type {number}
   */
  #position;

  /**
   * Creates a new DynBuffer
   */
  constructor() {
    this.#dataview = new DataView(new ArrayBuffer(0, { maxByteLength: 2 ** 30 }));
    this.#position = 0;
  }

  /**
   * Returns the number of bytes available from the current position in the buffer
   * @returns {number}
   */
  get bytesAvailable() {
    return (this.#dataview.byteLength - this.#position);
  }

  /**
   * Returns the whole buffer
   * @returns {ArrayBufferLike}
   */
  get buffer() {
    return this.#dataview.buffer;
  }

  /**
   * Returns the length of the buffer
   * @returns {number}
   */
  get length() {
    return this.#dataview.byteLength;
  }

  /**
   * Sets the length of the buffer
   * @param {number} value - The length to set the buffer to
   */
  set length(value) {
    // Todo - If the length is set to a value that is larger than the current length, the right side of the buffer is filled with zeros
    // Todo - If the length is set to a value that is smaller than the current length, the buffer is truncated
  }

  /**
   * Returns the current position in the buffer
   * @returns {number}
   */
  get position() {
    return this.#position;
  }


  /**
   * Ensures there's enough capacity to write X amount of bytes to the buffer, and if not, it'll resize the buffer appropriately
   * @private
   * @param {number} bytes - The initial amount of bytes needed to be written
   */
  #ensureCapacity(bytes) {
    if (this.bytesAvailable < bytes) {
      const newLength = (this.#dataview.byteLength + (bytes - this.bytesAvailable));

      this.#dataview.buffer.resize(newLength);
    }
  }

  /**
   * A simple wrapper around executing functions on the DataView class
   * @private
   * @param {string} func - The function name to execute
   * @param {number} bytes - The amount of bytes to ensure capacity and increment the position with
   * @param {number} [value] - The value to write to the buffer
   * @returns {number|undefined} When reading, a value is returned
   */
  #executeCall(func, bytes, value) {
    // Todo: Endian
    if (arguments.length === 3) { // Write
      this.#ensureCapacity(bytes);
      this.#dataview[func](this.#position, value);
      this.#position += bytes;
    } else { // Read
      const value = this.#dataview[func](this.#position);

      this.#position += bytes;

      return value;
    }
  }
}