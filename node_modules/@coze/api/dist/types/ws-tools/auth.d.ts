import jwt from 'jsonwebtoken';
import { type RequestOptions } from './core';
export declare const getWebAuthenticationUrl: (config: WebAuthenticationConfig) => string;
export declare const getPKCEAuthenticationUrl: (config: PKCEAuthenticationConfig) => Promise<{
    url: string;
    codeVerifier: string;
}>;
export declare const getWebOAuthToken: (config: WebOAuthTokenConfig, options?: RequestOptions) => Promise<OAuthToken>;
export declare const getPKCEOAuthToken: (config: PKCEOAuthTokenConfig, options?: RequestOptions) => Promise<OAuthToken>;
export declare const refreshOAuthToken: (config: RefreshOAuthTokenConfig, options?: RequestOptions) => Promise<OAuthToken>;
export declare const getDeviceCode: (config: DeviceCodeConfig, options?: RequestOptions) => Promise<DeviceCodeData>;
export declare const getDeviceToken: (config: DeviceTokenConfig, options?: RequestOptions) => Promise<OAuthToken>;
export declare const _getJWTToken: (config: {
    token: string;
    baseURL?: string;
    durationSeconds?: number;
    scope?: JWTScope;
    accountId?: string;
}, options?: RequestOptions) => Promise<JWTToken>;
export declare const getJWTToken: (config: JWTTokenConfig, options?: RequestOptions) => Promise<JWTToken>;
export interface DeviceCodeData {
    device_code: string;
    user_code: string;
    verification_uri: string;
    expires_in: number;
    interval: number;
}
export interface OAuthToken {
    access_token: string;
    refresh_token: string;
    expires_in: number;
}
export interface DeviceTokenData {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    error?: string;
    error_description?: string;
}
export interface JWTToken {
    access_token: string;
    expires_in: number;
}
export interface JWTScope {
    account_permission: {
        permission_list: string[];
    };
    attribute_constraint: {
        connector_bot_chat_attribute: {
            bot_id_list: string[];
        };
    };
}
export interface WebAuthenticationConfig {
    baseURL?: string;
    clientId: string;
    redirectUrl: string;
    state?: string;
    workspaceId?: string;
}
export interface PKCEAuthenticationConfig extends WebAuthenticationConfig {
    code_challenge_method?: string;
    workspaceId?: string;
}
export interface WebOAuthTokenConfig {
    code: string;
    baseURL?: string;
    clientId: string;
    redirectUrl: string;
    clientSecret: string;
}
export interface PKCEOAuthTokenConfig {
    code: string;
    baseURL?: string;
    clientId: string;
    redirectUrl: string;
    codeVerifier: string;
}
export interface RefreshOAuthTokenConfig {
    refreshToken: string;
    baseURL?: string;
    clientId: string;
    clientSecret?: string;
}
export interface DeviceCodeConfig {
    baseURL?: string;
    clientId: string;
    workspaceId?: string;
}
export interface DeviceTokenConfig {
    baseURL?: string;
    clientId: string;
    deviceCode: string;
    poll?: boolean;
}
export interface JWTTokenConfig {
    baseURL?: string;
    durationSeconds?: number;
    appId: string;
    aud: string;
    keyid: string;
    privateKey: string;
    algorithm?: jwt.Algorithm;
    scope?: JWTScope;
    /**Isolate different sub-resources under the same jwt account */
    sessionName?: string;
    accountId?: string;
}
export declare enum PKCEAuthErrorType {
    AUTHORIZATION_PENDING = "authorization_pending",
    SLOW_DOWN = "slow_down",
    ACCESS_DENIED = "access_denied",
    EXPIRED_TOKEN = "expired_token"
}
