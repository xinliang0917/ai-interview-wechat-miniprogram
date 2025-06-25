import { APIResource } from '../../resource';
import { type RequestOptions } from '../../../core';
export declare class Runs extends APIResource {
    /**
     * Initiates a workflow run. | 启动工作流运行。
     * @docs en: https://www.coze.com/docs/developer_guides/workflow_run?_lang=en
     * @docs zh: https://www.coze.cn/docs/developer_guides/workflow_run?_lang=zh
     * @param params.workflow_id - Required The ID of the workflow to run. | 必选 要运行的工作流 ID。
     * @param params.bot_id - Optional The ID of the bot associated with the workflow. | 可选 与工作流关联的机器人 ID。
     * @param params.parameters - Optional Parameters for the workflow execution. | 可选 工作流执行的参数。
     * @param params.ext - Optional Additional information for the workflow execution. | 可选 工作流执行的附加信息。
     * @param params.execute_mode - Optional The mode in which to execute the workflow. | 可选 工作流执行的模式。
     * @param params.connector_id - Optional The ID of the connector to use for the workflow. | 可选 用于工作流的连接器 ID。
     * @param params.app_id - Optional The ID of the app.  | 可选 要进行会话聊天的 App ID
     * @returns RunWorkflowData | 工作流运行数据
     */
    create(params: RunWorkflowReq, options?: RequestOptions): Promise<RunWorkflowData>;
    /**
     * Streams the workflow run events. | 流式传输工作流运行事件。
     * @docs en: https://www.coze.com/docs/developer_guides/workflow_stream_run?_lang=en
     * @docs zh: https://www.coze.cn/docs/developer_guides/workflow_stream_run?_lang=zh
     * @param params.workflow_id - Required The ID of the workflow to run. | 必选 要运行的工作流 ID。
     * @param params.bot_id - Optional The ID of the bot associated with the workflow. | 可选 与工作流关联的机器人 ID。
     * @param params.parameters - Optional Parameters for the workflow execution. | 可选 工作流执行的参数。
     * @param params.ext - Optional Additional information for the workflow execution. | 可选 工作流执行的附加信息。
     * @param params.execute_mode - Optional The mode in which to execute the workflow. | 可选 工作流执行的模式。
     * @param params.connector_id - Optional The ID of the connector to use for the workflow. | 可选 用于工作流的连接器 ID。
     * @param params.app_id - Optional The ID of the app.  | 可选 要进行会话聊天的 App ID
     * @returns Stream<WorkflowEvent, { id: string; event: string; data: string }> | 工作流事件流
     */
    stream(params: Omit<RunWorkflowReq, 'is_async'>, options?: RequestOptions): AsyncGenerator<WorkflowEvent, void, unknown>;
    /**
     * Resumes a paused workflow run. | 恢复暂停的工作流运行。
     * @docs en: https://www.coze.com/docs/developer_guides/workflow_resume?_lang=en
     * @docs zh: https://www.coze.cn/docs/developer_guides/workflow_resume?_lang=zh
     * @param params.workflow_id - Required The ID of the workflow to resume. | 必选 要恢复的工作流 ID。
     * @param params.event_id - Required The ID of the event to resume from. | 必选 要从中恢复的事件 ID。
     * @param params.resume_data - Required Data needed to resume the workflow. | 必选 恢复工作流所需的数据。
     * @param params.interrupt_type - Required The type of interruption to resume from. | 必选 要恢复的中断类型。
     * @returns AsyncGenerator<WorkflowEvent, { id: string; event: string; data: string }> | 工作流事件流
     */
    resume(params: ResumeWorkflowReq, options?: RequestOptions): AsyncGenerator<WorkflowEvent, void, unknown>;
    /**
     * Get the workflow run history | 工作流异步运行后，查看执行结果
     * @docs zh: https://www.coze.cn/open/docs/developer_guides/workflow_history
     * @param workflowId - Required The ID of the workflow. | 必选 工作流 ID。
     * @param executeId - Required The ID of the workflow execution. | 必选 工作流执行 ID。
     * @returns WorkflowExecuteHistory[] | 工作流执行历史
     */
    history(workflowId: string, executeId: string, options?: RequestOptions): Promise<WorkflowExecuteHistory[]>;
}
export interface RunWorkflowReq {
    workflow_id: string;
    bot_id?: string;
    parameters?: Record<string, unknown>;
    ext?: Record<string, string>;
    app_id?: string;
    is_async?: boolean;
}
export interface RunWorkflowData {
    data: string;
    cost: string;
    token: number;
    msg: string;
    debug_url: string;
    execute_id: string;
}
export interface ResumeWorkflowReq {
    workflow_id: string;
    event_id: string;
    resume_data: string;
    interrupt_type: number;
}
export declare enum WorkflowEventType {
    MESSAGE = "Message",
    ERROR = "Error",
    DONE = "Done",
    INTERRUPT = "Interrupt"
}
export interface WorkflowEventMessage {
    content: string;
    node_title: string;
    node_seq_id: string;
    node_is_finish: boolean;
    ext?: Record<string, unknown>;
}
interface WorkflowEventInterruptData {
    event_id: string;
    type: number;
}
export interface WorkflowEventInterrupt {
    interrupt_data: WorkflowEventInterruptData;
    node_title: string;
}
export interface WorkflowEventError {
    error_code: number;
    error_message: string;
}
export interface WorkflowExecuteHistory {
    execute_id: string;
    execute_status: 'Success' | 'Running' | 'Fail';
    bot_id: string;
    connector_id: string;
    connector_uid: string;
    run_mode: 0 | 1 | 2;
    logid: string;
    create_time: number;
    update_time: number;
    output: string;
    token: string;
    cost: string;
    error_code: string;
    error_message: string;
    debug_url: string;
}
export declare class WorkflowEvent {
    id: number;
    event: WorkflowEventType;
    data?: WorkflowEventMessage | WorkflowEventInterrupt | WorkflowEventError;
    constructor(id: number, event: WorkflowEventType, data?: WorkflowEventMessage | WorkflowEventInterrupt | WorkflowEventError);
}
export {};
