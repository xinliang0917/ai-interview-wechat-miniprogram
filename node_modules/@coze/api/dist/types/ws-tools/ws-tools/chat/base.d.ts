import { type WavStreamPlayer } from '../wavtools';
import SentenceSynchronizer from './sentence-synchronizer';
import OpusDecoder from './opus-decoder';
import { type WsChatCallbackHandler, type WsChatClientOptions, type WsChatEventData } from '../types';
import { type AudioCodec, CozeAPI, type CreateChatWsReq, type CreateChatWsRes, type WebSocketAPI } from '../../index';
declare abstract class BaseWsChatClient {
    ws: WebSocketAPI<CreateChatWsReq, CreateChatWsRes> | null;
    protected listeners: Map<string, Set<WsChatCallbackHandler>>;
    protected wavStreamPlayer?: WavStreamPlayer;
    protected trackId: string;
    protected api: CozeAPI;
    protected audioDeltaList: string[];
    config: WsChatClientOptions;
    protected outputAudioCodec: AudioCodec;
    protected outputAudioSampleRate: number;
    protected sentenceSynchronizer: SentenceSynchronizer;
    protected opusDecoder?: OpusDecoder;
    protected isConnected: boolean;
    constructor(config: WsChatClientOptions);
    protected init(): Promise<WebSocketAPI<CreateChatWsReq, CreateChatWsRes>>;
    sendMessage(data: CreateChatWsReq): void;
    sendTextMessage(text: string): void;
    /**
     * en: Add event listener(s)
     * zh: 添加事件监听器
     * @param event - string | string[] Event name or array of event names
     * @param callback - Event callback function
     */
    on(event: string | string[], callback: WsChatCallbackHandler): void;
    /**
     * en: Remove event listener(s)
     * zh: 移除事件监听器
     * @param event - string | string[] Event name or array of event names
     * @param callback - Event callback function to remove
     */
    off(event: string | string[], callback: WsChatCallbackHandler): void;
    protected initOpusDecoder(): Promise<void>;
    protected closeWs(): void;
    clear(): Promise<void>;
    protected emit(eventName: string, event: WsChatEventData): void;
    private handleAudioMessage;
    protected log(...args: any[]): boolean;
    protected warn(...args: any[]): boolean;
}
export default BaseWsChatClient;
