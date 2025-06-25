export declare function safeJsonParse(jsonString: string, defaultValue?: any): any;
export declare function sleep(ms: number): Promise<unknown>;
export declare function isUniApp(): boolean;
export declare function isBrowser(): boolean;
export declare function isPlainObject(obj: any): boolean;
export declare function mergeConfig(...objects: any[]): any;
export declare function isPersonalAccessToken(token?: string): boolean;
export declare function buildWebsocketUrl(path: string, params?: Record<string, any>): string;
export declare const isBrowserExtension: () => boolean;
