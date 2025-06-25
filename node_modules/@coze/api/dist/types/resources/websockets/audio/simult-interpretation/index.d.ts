import { type InputAudioBufferAppendEvent, type CommonErrorEvent, type SimultInterpretationUpdateEvent, type SimultInterpretationCreatedEvent, type SimultInterpretationUpdatedEvent, type SimultInterpretationAudioDeltaEvent, type SimultInterpretationTranscriptionDeltaEvent, type SimultInterpretationMessageCompletedEvent, type InputAudioBufferCompleteEvent, type InputAudioBufferCompletedEvent, type SimultInterpretationTranslationDeltaEvent } from '../../types';
import { APIResource } from '../../../resource';
import { type WebsocketOptions } from '../../../../core';
export declare class SimultInterpretation extends APIResource {
    create(options?: WebsocketOptions): Promise<import("../../../..").WebSocketAPI<CreateSimultInterpretationsWsReq, CreateSimultInterpretationsWsRes>>;
}
export type CreateSimultInterpretationsWsReq = SimultInterpretationUpdateEvent | InputAudioBufferAppendEvent | InputAudioBufferCompleteEvent;
export type CreateSimultInterpretationsWsRes = SimultInterpretationCreatedEvent | SimultInterpretationUpdatedEvent | SimultInterpretationAudioDeltaEvent | SimultInterpretationTranscriptionDeltaEvent | InputAudioBufferCompletedEvent | SimultInterpretationMessageCompletedEvent | SimultInterpretationTranslationDeltaEvent | CommonErrorEvent;
