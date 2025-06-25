/**
 * Local audio loopback implementation using WebRTC peer connections
 * to create a local audio communication channel.
 * 完整的音频回环生命周期管理：
 * connect() - 建立初始连接
 * start() - 开始音频回环
 * stop() - 暂停音频回环
 * cleanup() - 完全清理所有资源
 */
declare class LocalLoopback {
    pc1: RTCPeerConnection | undefined;
    pc2: RTCPeerConnection | undefined;
    remoteAudio: HTMLAudioElement;
    context: AudioContext | undefined;
    mic: MediaStreamAudioSourceNode | undefined;
    peer: MediaStreamAudioDestinationNode | undefined;
    isDebug: boolean;
    mediaStream: MediaStream | undefined;
    private eventListeners;
    private currentStreamNode;
    /**
     * Initializes a new instance of LocalLoopback
     * @param isDebug - Whether to enable debug logging
     */
    constructor(isDebug?: boolean);
    /**
     * Establishes a connection between two RTCPeerConnection objects
     * to create a local audio loopback channel
     * @param context - The AudioContext to use for audio processing
     * @param stream - The MediaStream to use for the loopback
     */
    connect(context: AudioContext, stream?: MediaStream): Promise<void>;
    /**
     * 检查WebRTC连接状态，确保 ICE State 处于 connected 状态
     * @returns
     */
    checkForReady(): Promise<true | undefined>;
    /**
     * Starts the audio loopback by connecting the provided AudioWorkletNode
     * to the peer destination
     * @param streamNode - The AudioWorkletNode to connect to the peer destination
     */
    start(streamNode: AudioWorkletNode): void;
    /**
     * Stops the audio loopback temporarily without destroying connections
     * Can be restarted by calling start() again
     */
    stop(): void;
    /**
     * Reconnects the WebRTC peer connections
     * This method closes existing connections and establishes new ones
     * while preserving the audio context and stream configuration
     */
    reconnect(): Promise<boolean>;
    private sleep;
    /**
     * Creates and connects audio processing nodes for the media stream
     * @param context - The AudioContext to use for creating audio nodes
     * @returns The processed MediaStream or undefined if no stream is available
     * @private
     */
    private applyFilter;
    /**
     * Handles the incoming remote stream from the peer connection
     * @param e - The RTCTrackEvent containing the remote stream
     * @private
     */
    private gotRemoteStream;
    /**
     * Handles the SDP offer from the first peer connection (pc1)
     * @param desc - The RTCSessionDescriptionInit containing the SDP offer
     * @private
     */
    private gotDescription1;
    /**
     * Handles the SDP answer from the second peer connection (pc2)
     * @param desc - The RTCSessionDescriptionInit containing the SDP answer
     * @private
     */
    private gotDescription2;
    /**
     * Processes ICE candidates and forwards them to the other peer connection
     * @param pc - The RTCPeerConnection that generated the candidate
     * @param event - The RTCPeerConnectionIceEvent containing the candidate
     * @private
     */
    private onIceCandidate;
    /**
     * Returns the other peer connection (pc1 or pc2) based on the input
     * @param pc - The RTCPeerConnection to find the counterpart for
     * @returns The other RTCPeerConnection
     * @private
     */
    private getOtherPc;
    /**
     * Returns the name ('pc1' or 'pc2') of the peer connection for logging
     * @param pc - The RTCPeerConnection to get the name for
     * @returns The name of the peer connection
     * @private
     */
    private getName;
    /**
     * Handles successful addition of an ICE candidate
     * @param pc - The RTCPeerConnection that successfully added the candidate
     * @private
     */
    private onAddIceCandidateSuccess;
    /**
     * Handles errors that occur when adding an ICE candidate
     * @param pc - The RTCPeerConnection that failed to add the candidate
     * @param error - The error that occurred
     * @private
     */
    private onAddIceCandidateError;
    /**
     * Handles ICE connection state changes
     * @param pc - The RTCPeerConnection whose ICE state changed
     * @param event - The event object containing state change information
     * @private
     */
    private onIceStateChange;
    /**
     * Logs debug information if debug mode is enabled
     * @param args - Arguments to pass to console.log
     * @private
     */
    private _debug;
    /**
     * Logs error messages to the console
     * @param args - Arguments to pass to console.error
     * @private
     */
    private _error;
    /**
     * Logs warning messages to the console
     * @param args - Arguments to pass to console.warn
     * @private
     */
    private _warn;
    /**
     * Attempts to unlock the audio context for iOS devices
     * Creates a silent audio element and plays it on user interaction
     * to bypass iOS autoplay restrictions
     * @private
     */
    private _unlockAudioContext;
    /**
     * Cleans up all resources used by the LocalLoopback instance
     * This should be called when the instance is no longer needed to prevent memory leaks
     */
    cleanup(): void;
}
export default LocalLoopback;
