import { type AxiosResponseHeaders } from 'axios';
export declare class CozeError extends Error {
}
export declare class APIError extends CozeError {
    readonly status: number | undefined;
    readonly headers: AxiosResponseHeaders | undefined;
    readonly code: number | null | undefined;
    readonly msg: string | null | undefined;
    readonly detail: string | null | undefined;
    readonly logid: string | null | undefined;
    readonly rawError: any;
    constructor(status: number | undefined, error: ErrorRes | undefined, message: string | undefined, headers: AxiosResponseHeaders | undefined);
    private static makeMessage;
    static generate(status: number | undefined, errorResponse: ErrorRes | undefined, message: string | undefined, headers: AxiosResponseHeaders | undefined): APIError | BadRequestError | AuthenticationError | PermissionDeniedError | NotFoundError | RateLimitError | TimeoutError | GatewayError | InternalServerError;
}
export declare class APIConnectionError extends APIError {
    readonly status: undefined;
    constructor({ message }: {
        message?: string;
        cause?: Error | undefined;
    });
}
export declare class APIUserAbortError extends APIError {
    readonly name = "UserAbortError";
    readonly status: undefined;
    constructor(message?: string);
}
export declare class BadRequestError extends APIError {
    readonly name = "BadRequestError";
    readonly status: 400;
}
export declare class AuthenticationError extends APIError {
    readonly name = "AuthenticationError";
    readonly status: 401;
}
export declare class PermissionDeniedError extends APIError {
    readonly name = "PermissionDeniedError";
    readonly status: 403;
}
export declare class NotFoundError extends APIError {
    readonly name = "NotFoundError";
    readonly status: 404;
}
export declare class TimeoutError extends APIError {
    readonly name = "TimeoutError";
    readonly status: 408;
}
export declare class RateLimitError extends APIError {
    readonly name = "RateLimitError";
    readonly status: 429;
}
export declare class InternalServerError extends APIError {
    readonly name = "InternalServerError";
    readonly status: 500;
}
export declare class GatewayError extends APIError {
    readonly name = "GatewayError";
    readonly status: 502;
}
export declare const castToError: (err: unknown) => Error;
export interface ErrorRes {
    code: number;
    msg?: string;
    detail?: {
        logid?: string;
    };
    /** @deprecated use detail instead */
    error?: {
        logid?: string;
        detail?: string;
        help_doc?: string;
    };
}
export declare class JSONParseError extends Error {
    readonly cause?: unknown;
    constructor({ message, cause }: {
        message: string;
        cause?: unknown;
    });
}
