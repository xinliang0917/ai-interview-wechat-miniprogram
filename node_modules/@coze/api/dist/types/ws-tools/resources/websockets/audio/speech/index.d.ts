import { type CommonErrorEvent, type InputTextBufferAppendEvent, type InputTextBufferCompletedEvent, type InputTextBufferCompleteEvent, type SpeechAudioCompletedEvent, type SpeechAudioUpdateEvent, type SpeechCreatedEvent, type SpeechUpdatedEvent, type SpeechUpdateEvent } from '../../types';
import { APIResource } from '../../../resource';
import { type WebsocketOptions } from '../../../../core';
export declare class Speech extends APIResource {
    create(req?: CreateSpeechReq, options?: WebsocketOptions): Promise<import("../../../..").WebSocketAPI<CreateSpeechWsReq, CreateSpeechWsRes>>;
}
export interface CreateSpeechReq {
    entity_type?: 'bot' | 'workflow';
    entity_id?: string;
}
export type CreateSpeechWsReq = SpeechUpdateEvent | InputTextBufferAppendEvent | InputTextBufferCompleteEvent;
export type CreateSpeechWsRes = SpeechCreatedEvent | InputTextBufferCompletedEvent | SpeechUpdatedEvent | SpeechAudioUpdateEvent | SpeechAudioCompletedEvent | CommonErrorEvent;
