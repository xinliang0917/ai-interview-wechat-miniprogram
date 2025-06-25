import { type WsTranscriptionClientOptions } from '../types';
import PcmRecorder from '../recorder/pcm-recorder';
import { type CreateTranscriptionsWsReq, type CreateTranscriptionsWsRes, type WebSocketAPI } from '../..';
declare class BaseWsTranscriptionClient {
    ws: WebSocketAPI<CreateTranscriptionsWsReq, CreateTranscriptionsWsRes> | null;
    protected listeners: Map<string, Set<(data: CreateTranscriptionsWsRes) => void>>;
    recorder: PcmRecorder;
    config: WsTranscriptionClientOptions;
    private api;
    constructor(config: WsTranscriptionClientOptions);
    init(): Promise<WebSocketAPI<CreateTranscriptionsWsReq, CreateTranscriptionsWsRes>>;
    /**
     * 监听一个或多个事件
     * @param event 事件名称或事件名称数组
     * @param callback 回调函数
     */
    on(event: string | string[], callback: (data: CreateTranscriptionsWsRes) => void): void;
    /**
     * 移除一个或多个事件的监听
     * @param event 事件名称或事件名称数组
     * @param callback 回调函数
     */
    off(event: string | string[], callback: (data: CreateTranscriptionsWsRes) => void): void;
    protected closeWs(): void;
    protected emit(event: string, data: CreateTranscriptionsWsRes): void;
}
export default BaseWsTranscriptionClient;
