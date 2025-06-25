import { type ILocalAudioTrack } from 'agora-rtc-sdk-ng/esm';
import { type AIDenoisingConfig, type AudioCaptureConfig, type WavRecordConfig } from '../types';
import { type AudioCodec } from '../../index';
export declare enum AIDenoiserProcessorMode {
    NSNG = "NSNG",
    STATIONARY_NS = "STATIONARY_NS"
}
export declare enum AIDenoiserProcessorLevel {
    SOFT = "SOFT",
    AGGRESSIVE = "AGGRESSIVE"
}
export interface PcmRecorderConfig {
    audioCaptureConfig?: AudioCaptureConfig;
    aiDenoisingConfig?: AIDenoisingConfig;
    mediaStreamTrack?: globalThis.MediaStreamTrack | (() => Promise<globalThis.MediaStreamTrack>);
    wavRecordConfig?: WavRecordConfig;
    deviceId?: string;
    audioMutedDefault?: boolean;
    debug?: boolean;
}
declare class PcmRecorder {
    audioTrack: ILocalAudioTrack | undefined;
    private recording;
    private static denoiser;
    private wavAudioProcessor;
    private audioProcessor;
    private wavAudioProcessor2;
    private processor;
    private pcmAudioCallback;
    private wavAudioCallback;
    private dumpAudioCallback;
    private static aiDenoiserSupport;
    config: PcmRecorderConfig;
    constructor(config: PcmRecorderConfig);
    start(inputAudioCodec?: AudioCodec): Promise<void>;
    record({ pcmAudioCallback, wavAudioCallback, dumpAudioCallback, }?: {
        pcmAudioCallback?: (data: {
            raw: ArrayBuffer;
        }) => void;
        wavAudioCallback?: (blob: Blob, name: string) => void;
        dumpAudioCallback?: (blob: Blob, name: string) => void;
        opusAudioCallback?: (data: {
            raw: ArrayBuffer;
        }) => void;
    }): void;
    private handleProcessor;
    /**
     * en: Pause audio recording temporarily
     * zh: 暂时暂停音频录制
     */
    pause(): void;
    /**
     * en: Resume audio recording
     * zh: 恢复音频录制
     */
    resume(): void;
    /**
     * en: Destroy and cleanup all resources
     * zh: 销毁并清理所有资源
     */
    destroy(): void;
    getStatus(): "ended" | "recording";
    getDenoiserEnabled(): boolean | undefined;
    setDenoiserEnabled(enabled: boolean): Promise<void>;
    setDenoiserMode(mode: AIDenoiserProcessorMode): Promise<void>;
    setDenoiserLevel(level: AIDenoiserProcessorLevel): Promise<void>;
    /**
     * 导出降噪处理过程中的音频数据文件
     */
    dump(): void;
    /**
     * 获取音频采样率
     */
    getSampleRate(): number;
    /**
     * 获取原始麦克风输入的MediaStream（总是返回未处理的原始输入）
     */
    getRawMediaStream(): MediaStream | undefined;
    private log;
    private warn;
    private checkProcessor;
    private isSupportAIDenoiser;
}
export default PcmRecorder;
