import { type IAudioProcessorContext } from 'agora-rte-extension';
import BaseAudioProcessor from './base-audio-processor';
declare class PcmAudioProcessor extends BaseAudioProcessor {
    name: 'PcmAudioProcessor';
    private chunkProcessor?;
    private workletNode?;
    private encoding;
    constructor(chunkProcessor: (data: ArrayBuffer) => void, encoding?: 'pcm' | 'g711a' | 'g711u');
    protected onNode(node: AudioNode, context: IAudioProcessorContext): Promise<void>;
    startRecording(): void;
    stopRecording(): void;
    /**
     * en: Destroy and cleanup resources
     * zh: 销毁并清理资源
     */
    destroy(): void;
}
export default PcmAudioProcessor;
