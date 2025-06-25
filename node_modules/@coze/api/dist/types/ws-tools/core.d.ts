import { type AxiosRequestConfig, type AxiosInstance } from 'axios';
import { WebSocketAPI } from './websocket-api';
import { type FetchAPIOptions } from './fetcher';
import { APIError } from './error';
import * as Errors from './error';
export type RequestOptions = Omit<AxiosRequestConfig, 'url' | 'method' | 'baseURL' | 'data' | 'responseType'> & {
    /** Whether to enable debug mode in current request */
    debug?: boolean;
    /** Error callback for API errors. Will be called when an API error occurs, but the error will still be thrown */
    onApiError?: (error: APIError) => void;
} & Record<string, unknown>;
export interface WebsocketOptions {
    WebSocket?: any;
    maxReconnectionDelay?: number;
    minReconnectionDelay?: number;
    reconnectionDelayGrowFactor?: number;
    minUptime?: number;
    connectionTimeout?: number;
    maxRetries?: number;
    maxEnqueuedMessages?: number;
    startClosed?: boolean;
    debug?: boolean;
    headers?: Record<string, string>;
}
export type GetToken = string | (() => Promise<string> | string);
export interface ClientOptions {
    /** baseURL, default is https://api.coze.com, Use https://api.coze.cn if you use https://coze.cn */
    baseURL?: string;
    /** Personal Access Token (PAT) or OAuth2.0 token, or a function to get token */
    token: GetToken;
    /** see https://github.com/axios/axios?tab=readme-ov-file#request-config */
    axiosOptions?: RequestOptions;
    /** Custom axios instance */
    axiosInstance?: AxiosInstance | unknown;
    /** Whether to enable debug mode */
    debug?: boolean;
    /** Custom headers */
    headers?: Headers | Record<string, unknown>;
    /** Whether Personal Access Tokens (PAT) are allowed in browser environments */
    allowPersonalAccessTokenInBrowser?: boolean;
    /** base websocket URL, default is wss://ws.coze.cn */
    baseWsURL?: string;
    /** websocket options */
    websocketOptions?: WebsocketOptions;
    /** Error callback for API errors. Will be called when an API error occurs, but the error will still be thrown */
    onApiError?: (error: APIError) => void;
}
export declare class APIClient {
    protected _config: ClientOptions;
    baseURL: string;
    token: GetToken;
    axiosOptions?: RequestOptions;
    axiosInstance?: AxiosInstance | unknown;
    debug: boolean;
    allowPersonalAccessTokenInBrowser: boolean;
    headers?: Headers | Record<string, unknown>;
    baseWsURL: string;
    constructor(config: ClientOptions);
    static APIError: typeof APIError;
    static BadRequestError: typeof Errors.BadRequestError;
    static AuthenticationError: typeof Errors.AuthenticationError;
    static PermissionDeniedError: typeof Errors.PermissionDeniedError;
    static NotFoundError: typeof Errors.NotFoundError;
    static RateLimitError: typeof Errors.RateLimitError;
    static InternalServerError: typeof Errors.InternalServerError;
    static GatewayError: typeof Errors.GatewayError;
    static TimeoutError: typeof Errors.TimeoutError;
    static UserAbortError: typeof Errors.APIUserAbortError;
    protected getToken(): Promise<string>;
    protected buildOptions(method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: unknown, options?: RequestOptions): Promise<FetchAPIOptions>;
    protected buildWebsocketOptions(options?: WebsocketOptions): Promise<WebsocketOptions>;
    makeRequest<Req, Rsp>(apiUrl: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: Req, isStream?: boolean, options?: RequestOptions): Promise<Rsp>;
    post<Req, Rsp>(apiUrl: string, body?: Req, isStream?: boolean, options?: RequestOptions): Promise<Rsp>;
    get<Req, Rsp>(apiUrl: string, param?: Req, isStream?: boolean, options?: RequestOptions): Promise<Rsp>;
    put<Req, Rsp>(apiUrl: string, body?: Req, isStream?: boolean, options?: RequestOptions): Promise<Rsp>;
    delete<Req, Rsp>(apiUrl: string, isStream?: boolean, options?: RequestOptions): Promise<Rsp>;
    makeWebsocket<Req, Rsp>(apiUrl: string, options?: WebsocketOptions): Promise<WebSocketAPI<Req, Rsp>>;
    getConfig(): ClientOptions;
    debugLog(forceDebug?: boolean, ...msgs: any[]): void;
}
