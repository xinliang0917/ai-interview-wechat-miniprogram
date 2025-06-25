declare class PcmPlayer {
    private wavStreamPlayer;
    private trackId;
    private totalDuration;
    private playbackStartTime;
    private playbackPauseTime;
    private playbackTimeout;
    private elapsedBeforePause;
    private onCompleted;
    private isPauseDefault;
    constructor({ onCompleted, isPauseDefault, }: {
        onCompleted: () => void;
        isPauseDefault?: boolean;
    });
    /**
     * Initializes the PCM player with a new track ID. This method must be called before using append.
     * After calling interrupt, init must be called again to reinitialize the player.
     * @param {Object} options - Initialization options
     * @param {boolean} [options.isPauseDefault=false] - Whether to start in paused state
     */
    init(): void;
    /**
     * Destroys the PCM player instance and cleans up resources.
     * Should be called when the page is unloaded or when the instance is no longer needed.
     */
    destroy(): Promise<void>;
    /**
     * Completes the current playback and triggers the onCompleted callback after remaining duration.
     * @private
     */
    complete(): void;
    /**
     * Interrupts the current playback. Any audio appended after interrupt will not play
     * until init is called again to reinitialize the player.
     */
    interrupt(): Promise<void>;
    /**
     * Pauses the current playback. The playback can be resumed from the paused position
     * by calling resume.
     */
    pause(): Promise<void>;
    /**
     * Resumes playback from the last paused position.
     */
    resume(): Promise<void>;
    /**
     * Toggles between play and pause states.
     * If currently playing, it will pause; if paused, it will resume playback.
     */
    togglePlay(): Promise<void>;
    /**
     * Checks if audio is currently playing.
     * @returns {boolean} True if audio is playing, false otherwise
     */
    isPlaying(): boolean;
    /**
     * Appends and plays a base64 encoded PCM audio chunk.
     * Must call init before using this method.
     * @param {string} message - Base64 encoded PCM audio data
     */
    append(message: string): Promise<void>;
}
export default PcmPlayer;
