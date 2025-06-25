/**
 * G.711 codec implementation for A-law and μ-law
 */
/**
 * Converts G.711 A-law encoded data to PCM16 format
 * @param {Uint8Array} alawData - A-law encoded data
 * @returns {Int16Array} - PCM16 data
 */
export declare function decodeAlaw(alawData: Uint8Array): Int16Array;
/**
 * Converts G.711 μ-law encoded data to PCM16 format
 * @param {Uint8Array} ulawData - μ-law encoded data
 * @returns {Int16Array} - PCM16 data
 */
export declare function decodeUlaw(ulawData: Uint8Array): Int16Array;
