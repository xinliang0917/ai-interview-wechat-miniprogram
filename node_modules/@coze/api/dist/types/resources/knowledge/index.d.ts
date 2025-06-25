import { OldDocuments } from './documents/index';
import { APIResource } from '../resource';
export declare class Knowledge extends APIResource {
    /**
     * @deprecated
     */
    documents: OldDocuments;
}
export * from './documents/index';
