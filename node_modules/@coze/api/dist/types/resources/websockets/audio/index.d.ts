import { APIResource } from '../../resource';
import { Transcriptions } from './transcriptions/index';
import { Speech } from './speech/index';
import { SimultInterpretation } from './simult-interpretation/index';
export * from './speech/index';
export * from './transcriptions/index';
export * from './simult-interpretation/index';
export declare class Audio extends APIResource {
    speech: Speech;
    transcriptions: Transcriptions;
    simultInterpretation: SimultInterpretation;
}
