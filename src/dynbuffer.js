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
   * Returns the number of bytes of data available for reading from the current position in the buffer to the end of the buffer
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
   * Returns the current position in the buffer
   * @returns {number}
   */
  get position() {
    return this.#position;
  }

  // Todo: JSdoc

  #ensureCapacity(bytes) {
    if (this.bytesAvailable < bytes) {
      const newLength = (this.#dataview.byteLength + (bytes - this.bytesAvailable));

      this.#dataview.buffer.resize(newLength);
    }
  }


  #executeCall(func, bytes, value) {
    // Todo: Endian
    if (arguments.length === 3) {
      this.#ensureCapacity(bytes);
      this.#dataview[func](this.#position, value);
      this.#position += bytes;
    } else {
      const value = this.#dataview[func](this.#position);

      this.#position += bytes;

      return value;
    }
  }
}