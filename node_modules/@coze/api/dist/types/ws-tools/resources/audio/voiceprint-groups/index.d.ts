import { APIResource } from '../../resource';
import { type RequestOptions } from '../../../core';
import { VoiceprintFeature } from './features';
export * from './features';
export declare class VoiceprintGroups extends APIResource {
    features: VoiceprintFeature;
    /**
     * Create voiceprint group
     */
    create(params: CreateVoiceprintGroupReq, options?: RequestOptions): Promise<CreateVoiceprintGroupData>;
    /**
     * Get voiceprint group list
     */
    list(params?: ListVoiceprintGroupReq, options?: RequestOptions): Promise<ListVoiceprintGroupData>;
    /**
     * Update voiceprint group
     */
    update(groupId: string, params: UpdateVoiceprintGroupReq, options?: RequestOptions): Promise<undefined>;
    /**
     * Delete voiceprint group
     */
    delete(groupId: string, options?: RequestOptions): Promise<undefined>;
}
export interface CreateVoiceprintGroupReq {
    coze_account_id?: string;
    name: string;
    desc?: string;
}
export interface CreateVoiceprintGroupData {
    id: string;
}
export interface ListVoiceprintGroupReq {
    coze_account_id?: string;
    page_num?: number;
    page_size?: number;
    /**
     * Fuzzy prefix matching
     */
    name?: string;
    /**
     * Match user ID
     */
    user_id?: string;
    /**
     * Voiceprint group ID
     */
    group_id?: string;
}
export interface ListVoiceprintGroupData {
    items?: VoiceprintGroup[];
    total?: number;
}
export interface UserInfo {
    id?: string;
    name?: string;
    nickname?: string;
    avatar_url?: string;
}
export interface VoiceprintGroup {
    id?: string;
    name?: string;
    desc?: string;
    created_at?: number;
    updated_at?: number;
    icon_url?: string;
    user_info?: UserInfo;
    feature_count?: number;
}
export interface UpdateVoiceprintGroupReq {
    name?: string;
    desc?: string;
}
