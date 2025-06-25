import { type WsChatEventData } from '../types';
import { type AudioCodec, type ConversationAudioSentenceStartEvent } from '../../index';
/**
 * 音字同步器配置选项
 */
export interface SentenceSynchronizerOptions {
    /**
     * 事件发射器，用于向外部发送事件
     */
    eventEmitter: (eventName: string, eventData: WsChatEventData) => void;
}
/**
 * 音字同步器 - 负责管理音频播放与文本显示的同步
 */
export declare class SentenceSynchronizer {
    /** 输出音频采样率 */
    private outputAudioSampleRate;
    /** 输出音频编码格式 */
    private outputAudioCodec;
    /** 句子列表队列 */
    private sentenceList;
    /** 首个音频delta的时间戳（用于计算实际经过的时间）*/
    private firstAudioDeltaTime;
    private currentSentenceIndex;
    private sentenceSwitchTimer;
    private eventEmitter;
    /**
     * 构造函数
     * @param options 同步器配置选项
     */
    constructor(options: SentenceSynchronizerOptions);
    /**
     * 设置首个句子首个音频 Delta 时间
     */
    setFirstAudioDeltaTime(): void;
    /**
     * 处理音频完成事件，标记最后一个句子
     */
    handleAudioCompleted(): void;
    /**
     * 处理句子开始事件
     * @param event 句子开始事件
     */
    handleSentenceStart(event: ConversationAudioSentenceStartEvent): void;
    /**
     * 更新指定句子的音频时长
     * @param sentenceId 句子ID
     * @param duration 音频时长增量
     */
    updateAudioDuration(sentenceId: string, duration: number): void;
    /**
     * 更新最后一个句子的音频时长
     * @param duration 音频时长增量
     * @returns 是否更新成功
     */
    updateLatestSentenceAudioDuration(contentLength: number): boolean;
    /**
     * 安排句子切换
     */
    private scheduleSentenceSwitch;
    /**
     * 发送客户端句子开始事件
     * @param sentenceItem 句子开始事件
     */
    private emitSentenceStart;
    /**
     * 发送客户端句子结束事件
     */
    private emitSentenceEnd;
    /**
     * 重置句子同步状态
     */
    resetSentenceSyncState(): void;
    setOutputAudioConfig(outputAudioSampleRate: number, outputAudioCodec: AudioCodec): void;
}
export default SentenceSynchronizer;
