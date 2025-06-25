import * as API from './resources/index';
import { APIClient } from './core';
export declare class CozeAPI extends APIClient {
    bots: API.Bots;
    chat: API.Chat;
    conversations: API.Conversations;
    files: API.Files;
    /**
     * @deprecated
     */
    knowledge: API.Knowledge;
    datasets: API.Datasets;
    workflows: API.Workflows;
    workspaces: API.WorkSpaces;
    audio: API.Audio;
    templates: API.Templates;
    websockets: API.Websockets;
    variables: API.Variables;
    users: API.Users;
}
export { type ClientOptions, type RequestOptions, type GetToken } from './core';
export * from './auth';
export * from './resources/index';
export * from './fetcher';
export * from './error';
export * from './constant';
export { WebSocketAPI } from './websocket-api';
