import { type WsChatClientOptions, WsChatEventNames } from '../types';
import { PcmRecorder, type AIDenoiserProcessorLevel, type AIDenoiserProcessorMode } from '../index';
import { type ChatUpdateEvent } from '../../index';
import BaseWsChatClient from './base';
export { WsChatEventNames };
declare class WsChatClient extends BaseWsChatClient {
    recorder: PcmRecorder;
    private isMuted;
    private inputAudioCodec;
    private turnDetection;
    private playbackVolume;
    constructor(config: WsChatClientOptions);
    startRecord(): Promise<void>;
    stopRecord(): void;
    connect({ chatUpdate, }?: {
        chatUpdate?: ChatUpdateEvent;
    }): Promise<void>;
    disconnect(): Promise<void>;
    /**
     * en: Set the audio enable
     * zh: 设置是否静音
     * @param enable - The enable to set
     */
    setAudioEnable(enable: boolean): Promise<void>;
    /**
     * en: Set the audio input device
     * zh: 设置音频输入设备
     * @param deviceId - The device ID to set
     */
    setAudioInputDevice(deviceId: string): Promise<void>;
    /**
     * en: Interrupt the conversation
     * zh: 打断对话
     */
    interrupt(): void;
    /**
     * en: Set the playback volume
     * zh: 设置播放音量
     * @param volume - The volume level to set (0.0 to 1.0)
     */
    setPlaybackVolume(volume: number): void;
    /**
     * en: Get the playback volume
     * zh: 获取播放音量
     * @returns The current volume level (0.0 to 1.0)
     */
    getPlaybackVolume(): number;
    /**
     * en: Set the denoiser enabled
     * zh: 设置是否启用降噪
     * @param enabled - The enabled to set
     */
    setDenoiserEnabled(enabled: boolean): void;
    /**
     * en: Set the denoiser level
     * zh: 设置降噪等级
     * @param level - The level to set
     */
    setDenoiserLevel(level: AIDenoiserProcessorLevel): void;
    /**
     * en: Set the denoiser mode
     * zh: 设置降噪模式
     * @param mode - The mode to set
     */
    setDenoiserMode(mode: AIDenoiserProcessorMode): void;
}
export default WsChatClient;
