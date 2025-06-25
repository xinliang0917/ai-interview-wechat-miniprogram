import type { AudioAnalysisOutputType } from './analysis/audio_analysis';
import type { WavPackerAudioType } from './wav_packer';
/**
 * Decodes audio into a wav file
 */
export type DecodedAudioType = {
    blob: Blob;
    url: string;
    values: Float32Array;
    audioBuffer: AudioBuffer;
};
interface AudioTrackConfig {
    [key: string]: any;
}
/**
 * Records live stream of user audio as PCM16 "audio/wav" data
 * @class
 */
export declare class WavRecorder {
    scriptSrc: string;
    sampleRate: number;
    outputToSpeakers: boolean;
    debug: boolean;
    _deviceChangeCallback: (() => Promise<void>) | null;
    _devices: any[];
    stream: MediaStream | null;
    processor: AudioWorkletNode | null;
    source: MediaStreamAudioSourceNode | null;
    node: AudioNode | null;
    analyser: AnalyserNode | null;
    recording: boolean;
    _lastEventId: number;
    eventReceipts: Record<number, any>;
    eventTimeout: number;
    _chunkProcessor: (data: {
        mono: ArrayBuffer;
        raw: ArrayBuffer;
    }) => any;
    _chunkProcessorSize: number | undefined;
    _chunkProcessorBuffer: {
        raw: ArrayBuffer;
        mono: ArrayBuffer;
    };
    /**
     * Create a new WavRecorder instance
     * @param {{sampleRate?: number, outputToSpeakers?: boolean, debug?: boolean}} [options]
     * @returns {WavRecorder}
     */
    constructor({ sampleRate, outputToSpeakers, debug, }?: {
        sampleRate?: number | undefined;
        outputToSpeakers?: boolean | undefined;
        debug?: boolean | undefined;
    });
    /**
     * Decodes audio data from multiple formats to a Blob, url, Float32Array and AudioBuffer
     * @param {Blob|Float32Array|Int16Array|ArrayBuffer|number[]} audioData
     * @param {number} sampleRate
     * @param {number} fromSampleRate
     * @returns {Promise<DecodedAudioType>}
     */
    static decode(audioData: Blob | Float32Array | Int16Array | ArrayBuffer | number[], sampleRate?: number, fromSampleRate?: number): Promise<DecodedAudioType>;
    /**
     * Logs data in debug mode
     * @param {...any} args
     * @returns {true}
     */
    log(...args: any[]): true;
    /**
     * Retrieves the current status of the recording
     * @returns {"ended"|"paused"|"recording"}
     */
    getStatus(): "ended" | "paused" | "recording";
    /**
     * Sends an event to the AudioWorklet
     * @private
     * @param {string} name
     * @param {{[key: string]: any}} data
     * @param {AudioWorkletNode} [_processor]
     * @returns {Promise<{[key: string]: any}>}
     */
    private _event;
    /**
     * Sets device change callback, remove if callback provided is `null`
     * @param {(Array<MediaDeviceInfo & {default: boolean}>): void|null} callback
     * @returns {true}
     */
    listenForDeviceChange(callback: ((devices: Array<MediaDeviceInfo & {
        default: boolean;
    }>) => void) | null): true;
    /**
     * Manually request permission to use the microphone
     * @returns {Promise<true>}
     */
    requestPermission(): Promise<true>;
    /**
     * Retrieves the current sampleRate for the recorder
     * @returns {number}
     */
    getSampleRate(): Promise<number>;
    /**
     * List all eligible devices for recording, will request permission to use microphone
     * @returns {Promise<Array<MediaDeviceInfo & {default: boolean}>>}
     */
    listDevices(): Promise<Array<MediaDeviceInfo & {
        default: boolean;
    }>>;
    /**
     * Begins a recording session and requests microphone permissions if not already granted
     * Microphone recording indicator will appear on browser tab but status will be "paused"
     * @param {string} [deviceId] if no device provided, default device will be used
     * @returns {Promise<true>}
     */
    begin({ deviceId }?: {
        deviceId?: string;
        audioTrackConfig?: AudioTrackConfig;
    }): Promise<true>;
    /**
     * Gets the current frequency domain data from the recording track
     * @param {"frequency"|"music"|"voice"} [analysisType]
     * @param {number} [minDecibels] default -100
     * @param {number} [maxDecibels] default -30
     * @returns {AudioAnalysisOutputType}
     */
    getFrequencies(analysisType?: "frequency" | "music" | "voice", minDecibels?: number, maxDecibels?: number): AudioAnalysisOutputType;
    /**
     * Pauses the recording
     * Keeps microphone stream open but halts storage of audio
     * @returns {Promise<true>}
     */
    pause(): Promise<true>;
    /**
     * Start recording stream and storing to memory from the connected audio source
     * @param {(data: { mono: Int16Array; raw: Int16Array }) => any} [chunkProcessor]
     * @param {number} [chunkSize] chunkProcessor will not be triggered until this size threshold met in mono audio
     * @returns {Promise<true>}
     */
    record(chunkProcessor?: (data: {
        mono: ArrayBuffer;
        raw: ArrayBuffer;
    }) => any, chunkSize?: number): Promise<true>;
    /**
     * Clears the audio buffer, empties stored recording
     * @returns {Promise<true>}
     */
    clear(): Promise<true>;
    /**
     * Reads the current audio stream data
     * @returns {Promise<{meanValues: Float32Array, channels: Array<Float32Array>}>}
     */
    read(): Promise<{
        meanValues: Float32Array;
        channels: Array<Float32Array>;
    }>;
    /**
     * Saves the current audio stream to a file
     * @param {boolean} [force] Force saving while still recording
     * @returns {Promise<WavPackerAudioType>}
     */
    save(force?: boolean): Promise<WavPackerAudioType>;
    /**
     * Ends the current recording session and saves the result
     * @returns {Promise<WavPackerAudioType>}
     */
    end(): Promise<WavPackerAudioType>;
    /**
     * Performs a full cleanup of WavRecorder instance
     * Stops actively listening via microphone and removes existing listeners
     * @returns {Promise<true>}
     */
    quit(): Promise<true>;
}
export {};
