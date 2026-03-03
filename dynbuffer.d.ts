/**
 * @author SeirDotExe
 * @license BSD-3-Clause
 */
export default class DynBuffer {
    /**
     * Returns the number of bytes available from the current position in the buffer
     * @returns {number}
     */
    get bytesAvailable(): number;
    /**
     * Returns the whole buffer
     * @returns {Buffer}
     */
    get stream(): Buffer;
    /**
     * Sets the length of the buffer
     * @param {number} value - The length to set the buffer to
     */
    set length(value: number);
    /**
     * Returns the length of the buffer
     * @returns {number}
     */
    get length(): number;
    /**
     * Sets the current position in the buffer
     * @param {number} value - The value to set the position to
     */
    set position(value: number);
    /**
     * Returns the current position in the buffer
     * @returns {number}
     */
    get position(): number;
    /**
     * Sets the byte order
     * @param {'BE'|'LE'} value - The endianness to set the byte order to, either BE for big endian, or LE for little endian
     */
    set endian(value: "BE" | "LE");
    /**
     * Returns the byte order
     * @returns {'BE'|'LE'}
     */
    get endian(): "BE" | "LE";
    /**
     * Converts the buffer to string
     * @param {'ascii'|'utf8'|'utf16le'|'ucs2'|'base64'|'base64url'|'latin1'|'binary'|'hex'} [encoding=utf8] - The encoding set to encode the buffer to
     * @param {boolean} [prettyHex=false] - When using hex for encoding, define if the hex string is pretty (with spacing and formatted) or not
     * @returns {string} The buffer represented as a string
     */
    toString(encoding?: "ascii" | "utf8" | "utf16le" | "ucs2" | "base64" | "base64url" | "latin1" | "binary" | "hex", prettyHex?: boolean): string;
    /**
     * Clears the contents of the buffer and resets the position to 0
     */
    clear(): void;
    /**
     * Compresses the buffer
     * @async
     * @param {'zlib'|'deflate'|'gzip'|'brotli'} [algorithm=zlib] - The algorithm to compress the buffer with
     * @throws {ReferenceError} The value must be a valid compression algorithm
     */
    compress(algorithm?: "zlib" | "deflate" | "gzip" | "brotli"): Promise<void>;
    /**
     * Decompresses the buffer
     * @async
     * @param {'zlib'|'deflate'|'gzip'|'brotli'} [algorithm=zlib] - The algorithm to decompress the buffer with
     * @throws {ReferenceError} The value must be a valid compression algorithm
     */
    uncompress(algorithm?: "zlib" | "deflate" | "gzip" | "brotli"): Promise<void>;
    /**
     * Writes a byte
     * @param {number} value - The byte to write to the buffer
     */
    writeByte(value: number): void;
    /**
     * Reads a signed byte from the buffer
     * @returns {number} The signed byte
     */
    readByte(): number;
    /**
     * Reads an unsigned byte from the buffer
     * @returns {number} The unsigned byte
     */
    readUnsignedByte(): number;
    /**
     * Writes a sequence of 'length' bytes from the specified buffer, 'bytes', starting 'position' (zero-based index) bytes
     * @param {DynBuffer|Buffer} bytes - The DynBuffer (or Buffer) to write the bytes from, and into the buffer
     * @param {number} [position=0] - A zero-based index indicating the position into the array to begin writing
     * @param {number} [length=0] - An unsigned integer indicating how far into the buffer to write
     * @throws {RangeError} If the given length is greater than the remaining space in the destination buffer
     */
    writeBytes(bytes: DynBuffer | Buffer, position?: number, length?: number): void;
    /**
     * Reads the number of data bytes, specified by the 'length' parameter, from the buffer.
     * The bytes are read into the DynBuffer object specified by the 'bytes' parameter.
     * The bytes are written into the destination DynBuffer starting at the position specified by 'position'
     * @param {DynBuffer} bytes - The DynBuffer to read data into
     * @param {number} [position=0] - The position at which the read data should be written
     * @param {number} [length=0] - The number of bytes to read
     * @throws {RangeError} If the given length is greater than the amount of bytes available
     */
    readBytes(bytes: DynBuffer, position?: number, length?: number): void;
    /**
     * Writes a boolean based value
     * @param {boolean|number} value - The boolean based value to write to the buffer
     */
    writeBoolean(value: boolean | number): void;
    /**
     * Reads a boolean based value from the buffer
     * @returns {boolean} The boolean based value
     */
    readBoolean(): boolean;
    /**
     * Writes a 16-bit integer
     * @param {number} value - The 16-bit integer to write to the buffer
     */
    writeShort(value: number): void;
    /**
     * Reads a signed 16-bit integer from the buffer
     * @returns {number} The signed 16-bit integer
     */
    readShort(): number;
    /**
     * Reads an unsigned 16-bit integer from the buffer
     * @returns {number} The unsigned 16-bit integer
     */
    readUnsignedShort(): number;
    /**
     * Writes a 32-bit signed integer
     * @param {number} value - The 32-bit signed integer to write to the buffer
     */
    writeInt(value: number): void;
    /**
     * Reads a signed 32-bit integer from the buffer
     * @returns {number} The signed 32-bit integer
     */
    readInt(): number;
    /**
     * Writes an unsigned 32-bit integer
     * @param {number} value - The unsigned 32-bit integer to write to the buffer
     */
    writeUnsignedInt(value: number): void;
    /**
     * Reads an unsigned 32-bit integer from the buffer
     * @returns {number} The unsigned 32-bit integer
     */
    readUnsignedInt(): number;
    /**
     * Writes an IEEE 754 single-precision (32-bit) floating-point number
     * @param {number} value - The IEEE 754 single-precision (32-bit) floating-point number to write to the buffer
     */
    writeFloat(value: number): void;
    /**
     * Reads an IEEE 754 single-precision (32-bit) floating-point number from the buffer
     * @returns {number} The IEEE 754 single-precision (32-bit) floating-point number
     */
    readFloat(): number;
    /**
     * Writes an IEEE 754 double-precision (64-bit) floating-point number
     * @param {number} value - The IEEE 754 double-precision (64-bit) floating-point number to write to the buffer
     */
    writeDouble(value: number): void;
    /**
     * Reads an IEEE 754 double-precision (64-bit) floating-point number from the buffer
     * @returns {number} The IEEE 754 double-precision (64-bit) floating-point number
     */
    readDouble(): number;
    /**
     * Writes a signed long
     * @param {bigint} value - The signed long to write to the buffer
     */
    writeLong(value: bigint): void;
    /**
     * Reads a signed long from the buffer
     * @returns {bigint} The signed long
     */
    readLong(): bigint;
    /**
     * Writes an unsigned long
     * @param {bigint} value - The unsigned long to write to the buffer
     */
    writeUnsignedLong(value: bigint): void;
    /**
     * Reads an unsigned long from the buffer
     * @returns {bigint} The unsigned long
     */
    readUnsignedLong(): bigint;
    /**
     * Writes a multibyte string using the specified character set
     * @see https://github.com/pillarjs/iconv-lite/wiki/Supported-Encodings
     * @param {string} value - The multibyte string to write to the buffer
     * @param {string} [charSet=utf8] - The character set to encode the value with
     * @param {boolean} [source=false] - An internal parameter used for writeUTF to write the length of the string
     * @throws {Error} The character set must exist
     * @throws {RangeError} The encoded string exceeds the maximum length of uint16 for writeUTF
     */
    writeMultiByte(value: string, charSet?: string, source?: boolean): void;
    /**
     * Reads a multibyte string of specified length from the buffer using the specified character set
     * @see https://github.com/pillarjs/iconv-lite/wiki/Supported-Encodings
     * @param {number} length - The number of bytes to read
     * @param {string} [charSet=utf8] - The character set to decode the value to
     * @returns {string} The multibyte string
     * @throws {Error} The character set must exist
     */
    readMultiByte(length: number, charSet?: string): string;
    /**
     * Writes a UTF-8 string
     * @param {string} value - The UTF-8 string to write to the buffer
     */
    writeUTF(value: string): void;
    /**
     * Reads a UTF-8 string from the buffer
     * @returns {string} The UTF-8 string
     */
    readUTF(): string;
    /**
     * Writes a UTF-8 string but without the length of the string
     * @param {string} value - The UTF-8 string to write to the buffer
     */
    writeUTFBytes(value: string): void;
    /**
     * Reads a sequence of UTF-8 bytes, specified by the length parameter, from the buffer
     * @param {number} length - The number of bytes to read
     * @returns {string} The UTF-8 string
     */
    readUTFBytes(length: number): string;
    #private;
}
