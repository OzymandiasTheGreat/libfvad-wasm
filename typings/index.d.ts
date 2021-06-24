declare enum VADMode {
	NORMAL = 0,
	LOW_BITRATE = 1,
	AGGRESSIVE = 2,
	VERY_AGGRESSIVE = 3,
}


declare enum VADEvent {
	ERROR = -1,
	SILENCE = 0,
	VOICE = 1,
}


declare class VAD {
	constructor(mode: VADMode, rate: number);

	static floatTo16BitPCM(buffer: Float32Array): Int16Array;

	processFrame(frame: Int16Array): VADEvent;
	processBuffer(buffer: Buffer | ArrayBufferView): VADEvent;
	destroy(): void;
}


declare function VADBuilder(): Promise<typeof VAD>;


export { VADBuilder as default, VADMode, VADBuilder }
