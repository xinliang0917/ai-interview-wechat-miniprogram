import { Runs } from './runs/index';
import { WorkflowChat } from './chat/index';
import { APIResource } from '../resource';
export declare class Workflows extends APIResource {
    runs: Runs;
    chat: WorkflowChat;
}
export * from './runs/index';
export * from './chat/index';
