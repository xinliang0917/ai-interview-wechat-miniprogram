import { type TranscriptionsUpdateEvent, type InputAudioBufferAppendEvent, type InputAudioBufferCompleteEvents, type InputAudioBufferClearEvent, type TranscriptionsCreatedEvent, type TranscriptionsUpdatedEvent, type InputAudioBufferCompletedEvent, type InputAudioBufferClearedEvent, type TranscriptionsMessageUpdateEvent, type TranscriptionsMessageCompletedEvent, type CommonErrorEvent } from '../../types';
import { APIResource } from '../../../resource';
import { type WebsocketOptions } from '../../../../core';
export declare class Transcriptions extends APIResource {
    create(req?: CreateTranscriptionsReq, options?: WebsocketOptions): Promise<import("../../../..").WebSocketAPI<CreateTranscriptionsWsReq, CreateTranscriptionsWsRes>>;
}
export interface CreateTranscriptionsReq {
    entity_type?: 'bot' | 'workflow';
    entity_id?: string;
}
export type CreateTranscriptionsWsReq = TranscriptionsUpdateEvent | InputAudioBufferAppendEvent | InputAudioBufferCompleteEvents | InputAudioBufferClearEvent;
export type CreateTranscriptionsWsRes = TranscriptionsCreatedEvent | TranscriptionsUpdatedEvent | InputAudioBufferCompletedEvent | InputAudioBufferClearedEvent | TranscriptionsMessageUpdateEvent | TranscriptionsMessageCompletedEvent | CommonErrorEvent;
