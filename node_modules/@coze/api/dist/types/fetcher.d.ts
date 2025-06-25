import { type AxiosRequestConfig, type AxiosResponse, type AxiosInstance } from 'axios';
export interface FetchAPIOptions extends AxiosRequestConfig {
    axiosInstance?: AxiosInstance | unknown;
    isStreaming?: boolean;
}
export declare const adapterFetch: (options: any) => Promise<any>;
export declare function fetchAPI<ResultType>(url: string, options?: FetchAPIOptions): Promise<{
    stream(): AsyncGenerator<ResultType>;
    json: () => ResultType;
    response: AxiosResponse<any, any>;
}>;
