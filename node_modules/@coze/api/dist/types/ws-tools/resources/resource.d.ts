import { type APIClient } from '../core';
export declare class APIResource {
    protected _client: APIClient;
    constructor(client: APIClient);
}
export interface ErrorData {
    detail?: string;
    logid?: string;
    help_doc?: string;
}
