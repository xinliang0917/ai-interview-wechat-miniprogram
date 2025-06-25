import { type WsSimultInterpretationClientOptions } from '../types';
import PcmRecorder from '../recorder/pcm-recorder';
import { type CreateSimultInterpretationsWsReq, type CreateSimultInterpretationsWsRes, type WebSocketAPI } from '../..';
declare class BaseWsSimultInterpretationClient {
    ws: WebSocketAPI<CreateSimultInterpretationsWsReq, CreateSimultInterpretationsWsRes> | null;
    protected listeners: Map<string, Set<(data: CreateSimultInterpretationsWsRes) => void>>;
    recorder: PcmRecorder;
    config: WsSimultInterpretationClientOptions;
    private api;
    constructor(config: WsSimultInterpretationClientOptions);
    init(): Promise<WebSocketAPI<CreateSimultInterpretationsWsReq, CreateSimultInterpretationsWsRes>>;
    /**
     * 监听一个或多个事件
     * @param event 事件名称或事件名称数组
     * @param callback 回调函数
     */
    on(event: string | string[], callback: (data: CreateSimultInterpretationsWsRes) => void): void;
    /**
     * 移除一个或多个事件的监听
     * @param event 事件名称或事件名称数组
     * @param callback 回调函数
     */
    off(event: string | string[], callback: (data: CreateSimultInterpretationsWsRes) => void): void;
    protected closeWs(): void;
    protected emit(event: string, data: CreateSimultInterpretationsWsRes): void;
}
export default BaseWsSimultInterpretationClient;
