import { AudioProcessor, type IAudioProcessorContext } from 'agora-rte-extension';
declare class WavAudioProcessor extends AudioProcessor {
    name: 'WavAudioProcessor';
    private onAudioData?;
    private workletNode?;
    constructor(onAudioData: (data: {
        wav: Blob;
    }) => void);
    protected onNode(node: AudioNode, context: IAudioProcessorContext): Promise<void>;
    startRecording(): void;
    stopRecording(): void;
    private createWavFile;
    /**
     * en: Destroy and cleanup resources
     * zh: 销毁并清理资源
     */
    destroy(): void;
}
export default WavAudioProcessor;
