import { APIResource } from '../../resource';
import { type RequestOptions } from '../../../core';
import { type UserInfo } from '..';
export declare class VoiceprintFeature extends APIResource {
    /**
     * Create voiceprint feature
     */
    create(groupId: string, params: CreateVoiceprintFeatureReq, options?: RequestOptions): Promise<CreateVoiceprintFeatureData>;
    /**
     * Update voiceprint feature
     */
    update(groupId: string, featureId: string, params: UpdateVoiceprintFeatureReq, options?: RequestOptions): Promise<undefined>;
    /**
     * Delete voiceprint feature
     */
    delete(groupId: string, featureId: string, options?: RequestOptions): Promise<undefined>;
    /**
     * Get voiceprint feature list
     */
    list(groupId: string, params?: ListVoiceprintFeatureReq, options?: RequestOptions): Promise<ListVoiceprintFeatureData>;
    /**
     * Speaker identification
     */
    speakerIdentify(groupId: string, params: SpeakerIdentifyReq, options?: RequestOptions): Promise<SpeakerIdentifyData>;
}
export interface CreateVoiceprintFeatureReq {
    file: File | any;
    name: string;
    desc?: string;
    sample_rate?: number;
    channel?: number;
}
export interface UpdateVoiceprintFeatureReq {
    file?: File | any;
    name?: string;
    desc?: string;
    sample_rate?: number;
    channel?: number;
}
export interface CreateVoiceprintFeatureData {
    id: string;
}
export interface ListVoiceprintFeatureReq {
    page_num?: number;
    page_size?: number;
}
export interface ListVoiceprintFeatureData {
    items?: VoiceprintFeature[];
    total?: number;
}
export interface VoiceprintFeature {
    id?: string;
    group_id?: string;
    name?: string;
    audio_url?: string;
    created_at?: number;
    updated_at?: number;
    desc?: string;
    icon_url?: string;
    user_info?: UserInfo;
}
export interface SpeakerIdentifyReq {
    file: File | any;
    top_k?: number;
    sample_rate?: number;
    channel?: number;
}
export interface FeatureScore {
    feature_id?: string;
    feature_name?: string;
    feature_desc?: string;
    score?: number;
}
export interface SpeakerIdentifyData {
    feature_score_list?: FeatureScore[];
}
