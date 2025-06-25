import { APIResource } from '../../resource';
import { type EnterMessage, type StreamChatData } from '../../chat/chat';
import { type RequestOptions } from '../../../core';
export declare class WorkflowChat extends APIResource {
    /**
     * Execute a chat workflow. | 执行对话流
     * @docs en: https://www.coze.cn/docs/developer_guides/workflow_chat?_lang=en
     * @docs zh: https://www.coze.cn/docs/developer_guides/workflow_chat?_lang=zh
     * @param params.workflow_id - Required The ID of the workflow to chat with. | 必选 要对话的工作流 ID。
     * @param params.additional_messages - Required Array of messages for the chat. | 必选 对话的消息数组。
     * @param params.parameters - Optional  Parameters for the workflow execution. | 必选 工作流执行的参数。
     * @param params.app_id - Optional The ID of the app. | 可选 应用 ID。
     * @param params.bot_id - Optional The ID of the bot. | 可选 Bot ID。
     * @param params.conversation_id - Optional The ID of the conversation. | 可选 会话 ID。
     * @param params.ext - Optional Additional information for the chat. | 可选 对话的附加信息。
     * @returns AsyncGenerator<StreamChatData> | 对话数据流
     */
    stream(params: ChatWorkflowReq, options?: RequestOptions): AsyncIterable<StreamChatData>;
}
export interface ChatWorkflowReq {
    workflow_id: string;
    additional_messages: EnterMessage[];
    parameters?: Record<string, unknown>;
    app_id?: string;
    bot_id?: string;
    conversation_id?: string;
    ext?: Record<string, string>;
}
