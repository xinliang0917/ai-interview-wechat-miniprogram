import { type IAudioProcessorContext } from 'agora-rte-extension';
import BaseAudioProcessor from './base-audio-processor';
/**
 * OpusAudioProcessor
 */
declare class OpusAudioProcessor extends BaseAudioProcessor {
    name: 'OpusAudioProcessor';
    private chunkProcessor?;
    private workletNode?;
    private encoder?;
    private encoderReady;
    constructor(chunkProcessor: (data: ArrayBuffer) => void);
    protected onNode(node: AudioNode, context: IAudioProcessorContext): Promise<void>;
    startRecording(): void;
    stopRecording(): void;
    /**
     * en: Destroy and cleanup resources
     * zh: 销毁并清理资源
     */
    destroy(): void;
}
export default OpusAudioProcessor;
