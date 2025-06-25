import { type WebSocketEventListenerMap, type Event, type CloseEvent } from 'reconnecting-websocket/dist/events';
import { type CommonErrorEvent } from './resources/websockets/types';
import { type WebsocketOptions } from './core';
declare global {
    function getMiniAppWebSocketFactory(): {
        getWebSocketImplementation: () => typeof WebSocket;
    } | null;
}
export declare class WebSocketAPI<Req, Rsp> {
    private rws;
    constructor(url: string, options?: WebsocketOptions);
    get readyState(): number;
    send(data: Req): void;
    close(code?: number, reason?: string): void;
    reconnect(code?: number, reason?: string): void;
    addEventListener(type: keyof WebSocketEventListenerMap, listener: EventListener): void;
    removeEventListener(type: keyof WebSocketEventListenerMap, listener: EventListener): void;
    onmessage: ((data: Rsp, event: MessageEvent) => void) | null;
    onopen: ((event: Event) => void) | null;
    onclose: ((event: CloseEvent) => void) | null;
    onerror: ((error: CommonErrorEvent, event: Event) => void) | null;
}
