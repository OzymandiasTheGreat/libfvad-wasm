export const VAD_FRAME = 480;


export const VADMode = Object.freeze({
	NORMAL: 0,
	LOW_BITRATE: 1,
	AGGRESSIVE: 2,
	VERY_AGGRESSIVE: 3,
});


export const VADEvent = Object.freeze({
	ERROR: -1,
	SILENCE: 0,
	VOICE: 1,
});


export default async function(binary) {
	const { instance } = await WebAssembly.instantiate(binary);
	const libfvad = instance.exports;

	class VAD {
		#destroyed = false;

		constructor(mode, rate) {
			this._handle = libfvad.fvad_new();

			if (!this._handle) {
				throw new Error("Memory allocation error: cannot instanciate libfvad");
			}

			if (libfvad.fvad_set_mode(this._handle, mode) < 0) {
				throw new Error(`Invalid mode: ${mode}`);
			}
			this.mode = mode;

			if (libfvad.fvad_set_sample_rate(this._handle, rate) < 0) {
				throw new Error(`Invalid sample rate: ${rate}`);
			}
			this.sampleRate = rate;
		}

		static floatTo16BitPCM(buffer) {
			const output = new Int16Array(buffer.length);
			for (let i = 0; i < buffer.length; i++) {
				let s = Math.max(-1, Math.min(1, buffer[i]));
				output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
			}
			return output;
		}

		processFrame(frame) {
			if (this.#destroyed) {
				throw new Error("This instance is already destroyed");
			}
			const bytes = frame.length * frame.BYTES_PER_ELEMENT;
			const ptr = libfvad.malloc(bytes);
			const data = new Uint8Array(libfvad.memory.buffer, ptr, bytes);
			data.set(new Uint8Array(frame.buffer));
			const result = libfvad.fvad_process(this._handle, data.byteOffset, frame.length);
			libfvad.free(data.byteOffset);
			return result;
		}

		processBuffer(buffer) {
			if (this.#destroyed) {
				throw new Error("This instance is already destroyed");
			}

			const results = [];
			const frame = new Int16Array(VAD_FRAME);

			for (let i = 0; i < buffer.length; i += VAD_FRAME) {
				frame.set(buffer.slice(i, i + VAD_FRAME));
				results.push(this.processFrame(frame));
			}

			const sum = results.reduce((a, b) => a + b);
			const count = results.filter((v) => v > 0).length;
			if (!sum) {
				return VADEvent.SILENCE;
			}
			if (results.some((v) => v < 0)) {
				return VADEvent.ERROR;
			}
			if (count >= (results.length * 0.8)) {
				return VADEvent.VOICE;
			}
			return VADEvent.SILENCE;
		}

		destroy() {
			libfvad.fvad_free(this._handle);
			this._handle = null;
			this.#destroyed = true;
		}
	}

	return VAD;
}
