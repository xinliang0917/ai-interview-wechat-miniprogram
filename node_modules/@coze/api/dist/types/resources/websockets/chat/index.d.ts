import { type InputAudioBufferSpeechStartedEvent, type InputAudioBufferSpeechStoppedEvent, type ChatCreatedEvent, type ChatUpdatedEvent, type ChatUpdateEvent, type CommonErrorEvent, type ConversationAudioCompletedEvent, type ConversationAudioDeltaEvent, type ConversationChatCompletedEvent, type ConversationChatCreatedEvent, type ConversationChatFailedEvent, type ConversationChatInProgressEvent, type ConversationChatSubmitToolOutputsEvent, type ConversationClearedEvent, type ConversationClearEvent, type ConversationMessageCompletedEvent, type ConversationMessageCreateEvent, type ConversationMessageDeltaEvent, type InputAudioBufferAppendEvent, type InputAudioBufferClearedEvent, type InputAudioBufferClearEvent, type InputAudioBufferCompletedEvent, type InputAudioBufferCompleteEvent, type ConversationChatCancelEvent, type ConversationChatCanceledEvent, type ConversationAudioTranscriptUpdateEvent, type ConversationAudioTranscriptCompletedEvent, type AudioDumpEvent, type ConversationAudioSentenceStartEvent } from '../types';
import { APIResource } from '../../resource';
import { type WebsocketOptions } from '../../../core';
export declare class Chat extends APIResource {
    create(req: CreateChatReq, options?: WebsocketOptions): Promise<import("../../..").WebSocketAPI<CreateChatWsReq, CreateChatWsRes>>;
}
export interface CreateChatReq {
    bot_id: string;
    workflow_id?: string;
}
export type CreateChatWsReq = ChatUpdateEvent | InputAudioBufferAppendEvent | InputAudioBufferCompleteEvent | InputAudioBufferClearEvent | ConversationMessageCreateEvent | ConversationClearEvent | ConversationChatSubmitToolOutputsEvent | ConversationChatCancelEvent;
export type CreateChatWsRes = ChatCreatedEvent | ChatUpdatedEvent | ConversationChatCreatedEvent | ConversationChatInProgressEvent | ConversationMessageDeltaEvent | ConversationAudioDeltaEvent | ConversationMessageCompletedEvent | ConversationAudioCompletedEvent | ConversationChatCompletedEvent | ConversationChatFailedEvent | CommonErrorEvent | InputAudioBufferCompletedEvent | InputAudioBufferClearedEvent | ConversationClearedEvent | InputAudioBufferSpeechStartedEvent | InputAudioBufferSpeechStoppedEvent | ConversationChatCanceledEvent | ConversationAudioTranscriptUpdateEvent | ConversationAudioTranscriptCompletedEvent | ConversationAudioSentenceStartEvent | AudioDumpEvent;
