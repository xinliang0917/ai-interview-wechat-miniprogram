import { type AIDenoiserProcessorLevel, type AIDenoiserProcessorMode } from '../recorder/pcm-recorder';
import { type SimultInterpretationUpdateEvent } from '../..';
import BaseWsSimultInterpretationClient from './base';
declare class WsSimultInterpretationClient extends BaseWsSimultInterpretationClient {
    private isRecording;
    private connect;
    destroy(): void;
    getStatus(): "ended" | "paused" | "recording";
    start(chatUpdate?: SimultInterpretationUpdateEvent): Promise<void>;
    /**
     * 停止录音，提交结果
     */
    stop(): void;
    /**
     * 暂停录音（保留上下文）
     */
    pause(): void;
    /**
     * 恢复录音
     */
    resume(): void;
    getDenoiserEnabled(): boolean | undefined;
    setDenoiserEnabled(enabled: boolean): Promise<void>;
    setDenoiserMode(mode: AIDenoiserProcessorMode): Promise<void>;
    setDenoiserLevel(level: AIDenoiserProcessorLevel): Promise<void>;
}
export default WsSimultInterpretationClient;
