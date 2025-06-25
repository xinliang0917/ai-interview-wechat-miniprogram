export interface OpusDecoderConfig {
    /**
     * Input sample rate of the encoded Opus data
     * @default 24000
     */
    inputSampleRate?: number;
    /**
     * Output sample rate for the decoded PCM data
     * If different from input, resampling will be performed
     * @default 24000
     */
    outputSampleRate?: number;
}
declare class OpusDecoder {
    private decoder;
    private decoderReady;
    private config;
    constructor(config: OpusDecoderConfig);
    /**
     * Decode Opus data to PCM audio
     * @param data Opus encoded data as Uint8Array
     * @returns Decoded PCM audio as Int16Array or null if error
     */
    decode(inputBuffer: Uint8Array): Int16Array | null;
    /**
     * Check if the decoder is ready
     */
    isReady(): boolean;
    /**
     * Wait for the decoder to be ready
     * @returns Promise that resolves when decoder is ready
     */
    waitForReady(): Promise<void>;
    /**
     * Release resources used by the decoder
     */
    destroy(): void;
}
export default OpusDecoder;
