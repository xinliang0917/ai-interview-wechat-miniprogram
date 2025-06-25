declare global {
    interface Window {
        __denoiser: AIDenoiserExtension;
        __denoiserSupported: boolean;
    }
}
import { AIDenoiserExtension } from 'agora-extension-ai-denoiser';
/**
 * Check audio device permissions
 * @returns {Promise<{audio: boolean}>} Whether audio device permission is granted
 */
export declare const checkDevicePermission: () => Promise<{
    audio: boolean;
}>;
/**
 * Get list of audio devices
 * @returns {Promise<{audioInputs: MediaDeviceInfo[], audioOutputs: MediaDeviceInfo[]}>} Audio devices
 */
export declare const getAudioDevices: () => Promise<{
    audioInputs: MediaDeviceInfo[];
    audioOutputs: MediaDeviceInfo[];
}>;
/**
 * Convert floating point numbers to 16-bit PCM
 * @param float32Array - Array of floating point numbers
 * @returns {ArrayBuffer} 16-bit PCM
 */
export declare const floatTo16BitPCM: (float32Array: Float32Array) => ArrayBuffer;
/**
 * Convert Float32Array to Int16Array (without going through ArrayBuffer)
 */
export declare function float32ToInt16Array(float32: Float32Array): Int16Array;
/**
 * Simple linear extraction method to downsample Float32Array from 48000Hz to 8000Hz
 * @param input Float32Array 48000Hz
 * @returns Float32Array 8000Hz
 */
export declare function downsampleTo8000(input: Float32Array): Float32Array;
/**
 * Check if device is mobile
 * @returns {boolean} Whether device is mobile
 */
export declare const isMobile: () => boolean;
export declare const isHarmonOS: () => boolean;
/**
 * Check if AI denoising is supported
 * @param assetsPath - Public path for denoising plugin
 * @returns {boolean} Whether AI denoising is supported
 */
export declare const checkDenoiserSupport: (assetsPath?: string) => boolean;
export declare const isBrowserExtension: () => boolean;
/**
 * Convert 16-bit linear PCM data to G.711 A-law
 * @param {Int16Array|Array} pcmData - 16-bit signed PCM sample data
 * @returns {Uint8Array} - G.711 A-law encoded data
 */
export declare function encodeG711A(pcmData: Int16Array): Uint8Array;
/**
 * Encode 16-bit PCM to G.711 μ-law (g711u)
 * @param pcm16 - Int16Array of PCM samples
 * @returns {Uint8Array} G.711U encoded data
 */
export declare function encodeG711U(pcm16: Int16Array): Uint8Array;
/**
 * Sets a value in an object at a specified path using dot notation.
 * Creates nested objects along the path if they don't exist.
 *
 * @param obj - The target object to modify
 * @param path - The path in dot notation (e.g., 'a.b.c')
 * @param value - The value to set at the specified path
 * @returns The modified object
 *
 * @example
 * // Set a value at a nested path
 * const obj = {};
 * setValueByPath(obj, 'user.profile.name', 'John');
 * // Result: { user: { profile: { name: 'John' } } }
 */
export declare function setValueByPath<T extends Record<string, any>, V>(obj: T, path: string, value: V): T;
